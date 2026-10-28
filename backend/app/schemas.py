"""
schemas.py — Pydantic request/response schemas for Campus Nukkad.
"""

from __future__ import annotations
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# Enumerations (as string literals for simplicity)
# ---------------------------------------------------------------------------

ISSUE_CATEGORIES = {"electrical", "plumbing", "wifi", "cleanliness", "furniture", "other"}
ISSUE_STATUSES = {"reported", "seen", "in_progress", "fixed"}
MEAL_TYPES = {"breakfast", "lunch", "dinner"}


# ---------------------------------------------------------------------------
# User Schemas
# ---------------------------------------------------------------------------

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------------------------------------------------------------------------
# Issue Schemas
# ---------------------------------------------------------------------------

class IssueCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=250)
    description: str = Field(..., min_length=10)
    category: str
    location: str = Field(..., min_length=1, max_length=200)
    photo_url: Optional[str] = Field(None, max_length=500)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in ISSUE_CATEGORIES:
            raise ValueError(f"category must be one of {ISSUE_CATEGORIES}")
        return v


class IssueResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    location: str
    photo_url: Optional[str]
    status: str
    created_by: int
    author_name: str  # Computed from relationship
    created_at: datetime
    vote_count: int

    model_config = {"from_attributes": True}


class IssueDetail(IssueResponse):
    """Extended issue response that includes comments, status timeline, and vote state."""
    comments: List[CommentResponse] = []
    status_updates: List[StatusUpdateResponse] = []
    user_voted: bool = False  # Whether the requesting user has already voted


# ---------------------------------------------------------------------------
# Vote Schemas
# ---------------------------------------------------------------------------

class VoteResponse(BaseModel):
    voted: bool
    vote_count: int


# ---------------------------------------------------------------------------
# Comment Schemas
# ---------------------------------------------------------------------------

class CommentCreate(BaseModel):
    text: str = Field(..., min_length=1)


class CommentResponse(BaseModel):
    id: int
    issue_id: int
    user_id: int
    author_name: str  # Computed from relationship
    text: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Status Update Schemas
# ---------------------------------------------------------------------------

class StatusUpdateCreate(BaseModel):
    status: str
    note: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ISSUE_STATUSES:
            raise ValueError(f"status must be one of {ISSUE_STATUSES}")
        return v


class StatusUpdateResponse(BaseModel):
    id: int
    issue_id: int
    status: str
    note: Optional[str]
    updated_by: int
    updated_by_name: str  # Computed from relationship
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Lost & Found Schemas
# ---------------------------------------------------------------------------

class LostFoundCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    found_location: str = Field(..., min_length=1, max_length=200)
    photo_url: Optional[str] = Field(None, max_length=500)


class LostFoundResponse(BaseModel):
    id: int
    item_name: str
    description: str
    photo_url: Optional[str]
    found_location: str
    found_by: int
    finder_name: str  # Computed from relationship
    claimed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Mess Pulse Schemas
# ---------------------------------------------------------------------------

class MessRateRequest(BaseModel):
    meal_type: str
    rating: int = Field(..., ge=1, le=5)
    date: Optional[date] = None  # Defaults to today server-side

    @field_validator("meal_type")
    @classmethod
    def validate_meal_type(cls, v: str) -> str:
        if v not in MEAL_TYPES:
            raise ValueError(f"meal_type must be one of {MEAL_TYPES}")
        return v


class MessRatingResponse(BaseModel):
    id: int
    meal_type: str
    rating: int
    date: date
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class MessDaySummary(BaseModel):
    """Average ratings for one day."""
    date: date
    breakfast: Optional[float] = None
    lunch: Optional[float] = None
    dinner: Optional[float] = None


class MessWeekResponse(BaseModel):
    days: List[MessDaySummary]


# ---------------------------------------------------------------------------
# Stats Schemas
# ---------------------------------------------------------------------------

class StatsResponse(BaseModel):
    fixed_this_month: int
    total_issues: int
    open_issues: int


# Resolve forward references for IssueDetail
IssueDetail.model_rebuild()
