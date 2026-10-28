"""
routes/admin.py — Admin-only endpoints.

GET   /admin/issues             → list all issues (with filters), admin only
PATCH /admin/issues/{id}/status → update issue status, creates status_update record
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas
from ..auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/issues", response_model=list[schemas.IssueResponse])
def admin_list_issues(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    sort: str = Query("newest", pattern="^(newest|upvotes)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    """
    Admin view of all issues.
    Supports the same filters as the public endpoint but with a higher default limit.
    Requires admin role.
    """
    q = db.query(models.Issue)

    if category:
        q = q.filter(models.Issue.category == category)
    if location:
        q = q.filter(models.Issue.location.ilike(f"%{location}%"))
    if status_filter:
        q = q.filter(models.Issue.status == status_filter)

    if sort == "upvotes":
        q = q.order_by(models.Issue.vote_count.desc(), models.Issue.created_at.desc())
    else:
        q = q.order_by(models.Issue.created_at.desc())

    issues = q.offset(offset).limit(limit).all()

    result = []
    for issue in issues:
        r = schemas.IssueResponse.model_validate(issue)
        r.author_name = issue.creator.name
        result.append(r)
    return result


@router.patch("/issues/{issue_id}/status", response_model=schemas.IssueResponse)
def update_issue_status(
    issue_id: int,
    body: schemas.StatusUpdateCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    """
    Update the status of an issue and append an entry to the status_updates timeline.
    Requires admin role.
    """
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    # Update the denormalized status on the issue
    issue.status = body.status

    # Record the status change in the timeline
    status_update = models.StatusUpdate(
        issue_id=issue_id,
        status=body.status,
        note=body.note,
        updated_by=admin.id,
    )
    db.add(status_update)
    db.commit()
    db.refresh(issue)

    response = schemas.IssueResponse.model_validate(issue)
    response.author_name = issue.creator.name
    return response


@router.post("/seed")
def admin_seed(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    """
    Populate demo data (students, issues, votes, comments, mess ratings).
    Requires admin authentication.
    """
    from ..seed_data import populate_demo_data
    msg = populate_demo_data(db)
    return {"status": "ok", "message": msg}
