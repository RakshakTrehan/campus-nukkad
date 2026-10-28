"""
routes/auth.py — Signup and Login endpoints.

POST /auth/signup  → create a new student account, return JWT
POST /auth/login   → verify credentials, return JWT
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(body: schemas.SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new student user.
    Returns a JWT token along with the created user profile.
    """
    # Ensure e-mail is not already taken
    existing = db.query(models.User).filter(models.User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = models.User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role="student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return schemas.AuthResponse(
        access_token=token,
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/login", response_model=schemas.AuthResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an existing user.
    Returns a JWT token along with the user profile.
    """
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(user.id)
    return schemas.AuthResponse(
        access_token=token,
        user=schemas.UserResponse.model_validate(user),
    )
