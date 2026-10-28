"""
main.py — FastAPI application entry point for Campus Nukkad.

Responsibilities:
- Create DB tables on startup
- Seed a default admin user if no users exist
- Register all routers with their URL prefixes
- Configure CORS (all origins, for hackathon development)
- Serve health-check endpoint at GET /
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import engine, SessionLocal
from . import models
from .auth import hash_password

# Import all route modules
from .routes import auth, issues, votes, comments, admin, lostfound, messpulse


# ---------------------------------------------------------------------------
# Startup / Shutdown lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    On startup:
      1. Create all tables (idempotent — skips existing tables).
      2. Seed a default admin user if the users table is empty.
    """
    # Create all ORM-defined tables
    models.Base.metadata.create_all(bind=engine)

    # Seed default admin
    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        if user_count == 0:
            admin_user = models.User(
                name="Campus Admin",
                email="admin@campus.edu",
                hashed_password=hash_password("admin123"),
                role="admin",
            )
            db.add(admin_user)
            db.commit()
            print("[Campus Nukkad] ✅ Default admin seeded: admin@campus.edu / admin123")
    finally:
        db.close()

    yield  # Application runs here

    # (Cleanup on shutdown could go here if needed)


# ---------------------------------------------------------------------------
# App instantiation
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Campus Nukkad API",
    description=(
        "Backend API for Campus Nukkad — a campus issue tracking web app. "
        "Features: issue reporting, upvotes, comments, admin status updates, "
        "lost & found board, and daily mess ratings."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow all origins for hackathon development
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)          # /auth/signup, /auth/login
app.include_router(issues.router)        # /issues
app.include_router(votes.router)         # /issues/{id}/vote
app.include_router(comments.router)      # /issues/{id}/comments, /comments/{id}
app.include_router(admin.router)         # /admin/issues
app.include_router(lostfound.router)     # /lostfound
app.include_router(messpulse.router)     # /mess/rate, /mess/week

# Stats router is defined inline below (simple enough not to need a separate file)
from fastapi import Depends
from sqlalchemy.orm import Session
from datetime import datetime
from .db import get_db
from . import schemas as s


@app.get("/stats", response_model=s.StatsResponse, tags=["Stats"])
def get_stats(db: Session = Depends(get_db)):
    """
    Return high-level platform statistics:
    - fixed_this_month: issues marked 'fixed' in the current calendar month
    - total_issues: all issues ever reported
    - open_issues: issues not yet fixed (status != 'fixed')
    """
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    fixed_this_month = (
        db.query(models.Issue)
        .filter(
            models.Issue.status == "fixed",
            models.Issue.created_at >= month_start,
        )
        .count()
    )

    total_issues = db.query(models.Issue).count()
    open_issues = db.query(models.Issue).filter(models.Issue.status != "fixed").count()

    return s.StatsResponse(
        fixed_this_month=fixed_this_month,
        total_issues=total_issues,
        open_issues=open_issues,
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "app": "Campus Nukkad"}
