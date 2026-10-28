"""
routes/votes.py — Vote toggle endpoint.

POST /issues/{id}/vote → toggles vote for the current user.
  - If not voted: adds vote, increments issue.vote_count
  - If already voted: removes vote, decrements issue.vote_count
Returns {voted: bool, vote_count: int}
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..db import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(tags=["Votes"])


@router.post("/issues/{issue_id}/vote", response_model=schemas.VoteResponse)
def toggle_vote(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Toggle the current user's vote on an issue.
    - If the user has NOT voted: adds vote and increments vote_count.
    - If the user HAS voted: removes vote and decrements vote_count.
    """
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    existing_vote = db.query(models.Vote).filter(
        models.Vote.issue_id == issue_id,
        models.Vote.user_id == current_user.id,
    ).first()

    if existing_vote:
        # Un-vote: remove the vote record and decrement the counter
        db.delete(existing_vote)
        issue.vote_count = max(0, issue.vote_count - 1)
        db.commit()
        return schemas.VoteResponse(voted=False, vote_count=issue.vote_count)
    else:
        # Vote: add a new vote record and increment the counter
        vote = models.Vote(issue_id=issue_id, user_id=current_user.id)
        db.add(vote)
        issue.vote_count = issue.vote_count + 1
        try:
            db.commit()
        except IntegrityError:
            # Race condition — vote already exists (unique constraint hit)
            db.rollback()
            issue.vote_count = max(0, issue.vote_count - 1)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already voted on this issue.",
            )
        return schemas.VoteResponse(voted=True, vote_count=issue.vote_count)
