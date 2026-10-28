"""
routes/comments.py — Comment endpoints.

POST   /issues/{id}/comments → add a comment (auth required)
DELETE /comments/{id}        → delete a comment (creator or admin only)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(tags=["Comments"])


@router.post(
    "/issues/{issue_id}/comments",
    response_model=schemas.CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    issue_id: int,
    body: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Add a comment to an issue. Requires authentication."""
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    comment = models.Comment(
        issue_id=issue_id,
        user_id=current_user.id,
        text=body.text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    response = schemas.CommentResponse.model_validate(comment)
    response.author_name = current_user.name
    return response


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Delete a comment.
    Only the comment author or an admin may delete it.
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this comment.",
        )

    db.delete(comment)
    db.commit()
