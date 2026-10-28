"""
routes/messpulse.py — Daily Mess Pulse endpoints.

POST /mess/rate  → submit a meal rating (one per user per meal_type per day)
GET  /mess/week  → average ratings per meal for the last 7 days
"""

from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..db import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/mess", tags=["Mess Pulse"])


@router.post("/rate", response_model=schemas.MessRatingResponse, status_code=status.HTTP_201_CREATED)
def rate_meal(
    body: schemas.MessRateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Submit a meal rating.
    Each user may rate each meal type (breakfast/lunch/dinner) only once per day.
    If date is omitted, today's date is used.
    """
    rating_date = body.date or date.today()

    # Check for an existing rating for this user/meal/date combo
    existing = db.query(models.MessRating).filter(
        models.MessRating.user_id == current_user.id,
        models.MessRating.meal_type == body.meal_type,
        models.MessRating.date == rating_date,
    ).first()

    if existing:
        # Update the existing rating instead of rejecting
        existing.rating = body.rating
        db.commit()
        db.refresh(existing)
        return schemas.MessRatingResponse.model_validate(existing)

    rating = models.MessRating(
        meal_type=body.meal_type,
        rating=body.rating,
        date=rating_date,
        user_id=current_user.id,
    )
    db.add(rating)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already rated this meal for today.",
        )
    db.refresh(rating)
    return schemas.MessRatingResponse.model_validate(rating)


@router.get("/week", response_model=schemas.MessWeekResponse)
def get_week_ratings(db: Session = Depends(get_db)):
    """
    Return average ratings per meal type for the last 7 days (including today).
    Days with no ratings will appear with None values for each meal.
    """
    today = date.today()
    seven_days_ago = today - timedelta(days=6)

    # Query average rating grouped by date and meal_type
    rows = (
        db.query(
            models.MessRating.date,
            models.MessRating.meal_type,
            func.avg(models.MessRating.rating).label("avg_rating"),
        )
        .filter(models.MessRating.date >= seven_days_ago)
        .group_by(models.MessRating.date, models.MessRating.meal_type)
        .all()
    )

    # Build a dict keyed by date
    day_map: dict[date, dict] = {}
    for row in rows:
        if row.date not in day_map:
            day_map[row.date] = {}
        day_map[row.date][row.meal_type] = round(row.avg_rating, 2)

    # Build the full 7-day list (all days, even if no data)
    days = []
    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        meal_avgs = day_map.get(d, {})
        days.append(
            schemas.MessDaySummary(
                date=d,
                breakfast=meal_avgs.get("breakfast"),
                lunch=meal_avgs.get("lunch"),
                dinner=meal_avgs.get("dinner"),
            )
        )

    return schemas.MessWeekResponse(days=days)
