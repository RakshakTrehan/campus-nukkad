"""
auth.py — JWT creation, password hashing, and FastAPI auth dependencies.

- Uses python-jose for JWT encoding/decoding
- Uses passlib (bcrypt) for password hashing
- Provides three dependencies:
    get_current_user      → requires valid Bearer token
    get_current_admin     → requires valid token + admin role
    get_optional_user     → returns user if token present, else None
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .db import get_db
from . import models

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return bcrypt hash of the given plain-text password."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the stored bcrypt hash."""
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_access_token(user_id: int) -> str:
    """Create a signed JWT token that embeds the user's id and an expiry."""
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _decode_token(token: str) -> Optional[int]:
    """
    Decode and validate a JWT token.
    Returns the user_id (int) on success, or None if the token is invalid/expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            return None
        return int(user_id_str)
    except (JWTError, ValueError):
        return None


# ---------------------------------------------------------------------------
# FastAPI security scheme (Bearer token)
# ---------------------------------------------------------------------------

bearer_scheme = HTTPBearer(auto_error=False)


def _get_user_from_credentials(
    credentials: Optional[HTTPAuthorizationCredentials],
    db: Session,
) -> Optional[models.User]:
    """Shared helper: decode credentials and load user from DB."""
    if credentials is None:
        return None
    user_id = _decode_token(credentials.credentials)
    if user_id is None:
        return None
    return db.query(models.User).filter(models.User.id == user_id).first()


# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """
    FastAPI dependency — raises 401 if no valid token is provided.
    Returns the authenticated User ORM object.
    """
    user = _get_user_from_credentials(credentials, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_admin(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """
    FastAPI dependency — raises 403 if the authenticated user is not an admin.
    Returns the admin User ORM object.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )
    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    """
    FastAPI dependency — returns the User if a valid token is present, else None.
    Does NOT raise on missing/invalid tokens.
    """
    return _get_user_from_credentials(credentials, db)
