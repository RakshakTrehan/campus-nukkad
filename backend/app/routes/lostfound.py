"""
routes/lostfound.py — Lost & Found board endpoints.

GET   /lostfound          → list all items (optional filter: claimed=true/false)
POST  /lostfound          → post a found item (auth required)
PATCH /lostfound/{id}/claim → mark item as claimed (auth required)
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/lostfound", tags=["Lost & Found"])


def _build_response(item: models.LostFound) -> schemas.LostFoundResponse:
    """Map LostFound ORM to response schema, adding finder_name."""
    r = schemas.LostFoundResponse.model_validate(item)
    r.finder_name = item.found_by_user.name
    return r


@router.get("", response_model=list[schemas.LostFoundResponse])
def list_lost_found(
    claimed: Optional[bool] = Query(None, description="Filter by claimed status"),
    db: Session = Depends(get_db),
):
    """List all lost & found items, optionally filtered by claimed status."""
    q = db.query(models.LostFound).order_by(models.LostFound.created_at.desc())
    if claimed is not None:
        q = q.filter(models.LostFound.claimed == claimed)
    items = q.all()
    return [_build_response(i) for i in items]


@router.post("", response_model=schemas.LostFoundResponse, status_code=status.HTTP_201_CREATED)
def post_found_item(
    body: schemas.LostFoundCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Report a found item. Requires authentication."""
    item = models.LostFound(
        item_name=body.item_name,
        description=body.description,
        found_location=body.found_location,
        photo_url=body.photo_url,
        found_by=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _build_response(item)


@router.patch("/{item_id}/claim", response_model=schemas.LostFoundResponse)
def claim_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Mark a lost & found item as claimed.
    Any authenticated user may claim an item (the claimant is assumed to be the owner).
    """
    item = db.query(models.LostFound).filter(models.LostFound.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    if item.claimed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This item has already been claimed.",
        )

    item.claimed = True
    db.commit()
    db.refresh(item)
    return _build_response(item)
