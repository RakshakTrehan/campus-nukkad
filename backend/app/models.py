"""
models.py — SQLAlchemy ORM models for Campus Nukkad.

Tables:
  - users
  - issues
  - votes
  - comments
  - status_updates
  - lost_found
  - mess_ratings
"""

from datetime import datetime, date as date_type
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date,
    ForeignKey, UniqueConstraint, Text
)
from sqlalchemy.orm import relationship
from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    # role: "student" (default) | "admin"
    role = Column(String(20), default="student", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    issues = relationship("Issue", back_populates="creator", foreign_keys="Issue.created_by")
    votes = relationship("Vote", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    status_updates = relationship("StatusUpdate", back_populates="updated_by_user")
    lost_found_items = relationship("LostFound", back_populates="found_by_user")
    mess_ratings = relationship("MessRating", back_populates="user")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=False)
    # category: electrical | plumbing | wifi | cleanliness | furniture | other
    category = Column(String(50), nullable=False)
    location = Column(String(200), nullable=False)
    photo_url = Column(String(500), nullable=True)
    # status: reported | seen | in_progress | fixed
    status = Column(String(30), default="reported", nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    # Denormalized vote count for fast sorting/display
    vote_count = Column(Integer, default=0, nullable=False)

    # Relationships
    creator = relationship("User", back_populates="issues", foreign_keys=[created_by])
    votes = relationship("Vote", back_populates="issue", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="issue", cascade="all, delete-orphan")
    status_updates = relationship("StatusUpdate", back_populates="issue", cascade="all, delete-orphan")

    @property
    def author_name(self) -> str:
        return self.creator.name if self.creator else "Anonymous"


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (
        UniqueConstraint("issue_id", "user_id", name="uq_vote_issue_user"),
    )

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    issue = relationship("Issue", back_populates="votes")
    user = relationship("User", back_populates="votes")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    issue = relationship("Issue", back_populates="comments")
    user = relationship("User", back_populates="comments")

    @property
    def author_name(self) -> str:
        return self.user.name if self.user else "Anonymous"


class StatusUpdate(Base):
    __tablename__ = "status_updates"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    status = Column(String(30), nullable=False)
    note = Column(Text, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    issue = relationship("Issue", back_populates="status_updates")
    updated_by_user = relationship("User", back_populates="status_updates")

    @property
    def updated_by_name(self) -> str:
        return self.updated_by_user.name if self.updated_by_user else "Admin"


class LostFound(Base):
    __tablename__ = "lost_found"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    found_location = Column(String(200), nullable=False)
    found_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    claimed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    found_by_user = relationship("User", back_populates="lost_found_items")

    @property
    def finder_name(self) -> str:
        return self.found_by_user.name if self.found_by_user else "Anonymous"


class MessRating(Base):
    __tablename__ = "mess_ratings"
    __table_args__ = (
        # One rating per user per meal type per date
        UniqueConstraint("user_id", "meal_type", "date", name="uq_mess_user_meal_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    # meal_type: breakfast | lunch | dinner
    meal_type = Column(String(20), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="mess_ratings")
