"""
routes/issues.py — Issue CRUD endpoints.

GET    /issues           → list issues (filterable, sortable, paginated)
POST   /issues           → create issue (auth required)
GET    /issues/{id}      → get single issue with comments & status timeline
DELETE /issues/{id}      → delete issue (creator or admin only)
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas
from ..auth import get_current_user, get_optional_user

router = APIRouter(prefix="/issues", tags=["Issues"])


def _build_issue_response(issue: models.Issue) -> schemas.IssueResponse:
    """Map an Issue ORM object to IssueResponse, adding the computed author_name."""
    data = schemas.IssueResponse.model_validate(issue)
    data.author_name = issue.creator.name
    return data


@router.get("", response_model=list[schemas.IssueResponse])
def list_issues(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    sort: str = Query("newest", pattern="^(newest|upvotes|most_upvoted)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    List issues with optional filters.
    - category: filter by category
    - location: case-insensitive substring match
    - status: filter by status
    - sort: 'newest' (default) | 'upvotes' / 'most_upvoted'
    - limit/offset: pagination
    """
    q = db.query(models.Issue)

    if category:
        q = q.filter(models.Issue.category.ilike(category.strip()))
    if location:
        q = q.filter(models.Issue.location.ilike(f"%{location}%"))
    if status_filter:
        q = q.filter(models.Issue.status == status_filter)

    if sort in ("upvotes", "most_upvoted"):
        q = q.order_by(models.Issue.vote_count.desc(), models.Issue.created_at.desc())
    else:
        q = q.order_by(models.Issue.created_at.desc())

    issues = q.offset(offset).limit(limit).all()
    return [_build_issue_response(i) for i in issues]


@router.post("", response_model=schemas.IssueResponse, status_code=status.HTTP_201_CREATED)
def create_issue(
    body: schemas.IssueCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new issue report. Requires authentication."""
    issue = models.Issue(
        title=body.title,
        description=body.description,
        category=body.category,
        location=body.location,
        photo_url=body.photo_url,
        created_by=current_user.id,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return _build_issue_response(issue)


@router.get("/{issue_id}", response_model=schemas.IssueDetail)
def get_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    """
    Get a single issue with full detail:
    - Comments (with author names)
    - Status update timeline
    - Whether the current user has voted
    """
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    # Build comment list with author names
    comment_responses = []
    for c in sorted(issue.comments, key=lambda x: x.created_at):
        cr = schemas.CommentResponse.model_validate(c)
        cr.author_name = c.user.name
        comment_responses.append(cr)

    # Build status update timeline with updater names
    status_responses = []
    for su in sorted(issue.status_updates, key=lambda x: x.created_at):
        sr = schemas.StatusUpdateResponse.model_validate(su)
        sr.updated_by_name = su.updated_by_user.name
        status_responses.append(sr)

    # Check if the current user has voted on this issue
    user_voted = False
    if current_user:
        vote = db.query(models.Vote).filter(
            models.Vote.issue_id == issue_id,
            models.Vote.user_id == current_user.id,
        ).first()
        user_voted = vote is not None

    detail = schemas.IssueDetail.model_validate(issue)
    detail.author_name = issue.creator.name
    detail.comments = comment_responses
    detail.status_updates = status_responses
    detail.user_voted = user_voted
    return detail


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Delete an issue.
    Only the issue creator or an admin may delete it.
    """
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    if issue.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this issue.",
        )

    db.delete(issue)
    db.commit()
