# Campus Nukkad — Backend API

FastAPI backend for **Campus Nukkad**, a campus issue-tracking web app built for a hackathon.

---

## Features

| Feature | Details |
|---------|---------|
| Auth | JWT-based (signup / login), 7-day token expiry |
| Issues | CRUD with upvotes, comments, status timeline |
| Admin | Status management with audit trail |
| Lost & Found | Post found items, mark as claimed |
| Mess Pulse | Daily meal ratings (1–5), 7-day averages |
| Stats | Fixed-this-month counter, totals |
| Docs | Auto-generated Swagger UI at `/docs` |

---

## Quick Start (Local Development)

### 1. Clone / navigate to the backend directory

```bash
cd campus-nukkad/backend
```

### 2. Create and activate a virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
# Copy the example file and edit if needed
copy .env.example .env     # Windows
# cp .env.example .env     # macOS/Linux
```

The default `.env` uses SQLite — no database installation required for local dev.

### 5. Run the development server

```bash
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**.

---

## Default Admin Credentials

A default admin user is automatically seeded on first startup (when the database is empty):

| Field    | Value               |
|----------|---------------------|
| Email    | `admin@campus.edu`  |
| Password | `admin123`          |
| Role     | `admin`             |

> **⚠️ Change the admin password before deploying to production.**

---

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## API Overview

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register a new student |
| POST | `/auth/login` | Login and receive JWT |

### Issues
| Method | Path | Description |
|--------|------|-------------|
| GET | `/issues` | List issues (filter by category/location/status, sort by newest/upvotes) |
| POST | `/issues` | Create issue *(auth)* |
| GET | `/issues/{id}` | Get issue detail with comments & timeline |
| DELETE | `/issues/{id}` | Delete issue *(creator or admin)* |

### Votes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/issues/{id}/vote` | Toggle vote on issue *(auth)* |

### Comments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/issues/{id}/comments` | Add comment *(auth)* |
| DELETE | `/comments/{id}` | Delete comment *(author or admin)* |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/issues` | List all issues *(admin)* |
| PATCH | `/admin/issues/{id}/status` | Update issue status *(admin)* |

### Lost & Found
| Method | Path | Description |
|--------|------|-------------|
| GET | `/lostfound` | List items (filter: `?claimed=true/false`) |
| POST | `/lostfound` | Post a found item *(auth)* |
| PATCH | `/lostfound/{id}/claim` | Mark item as claimed *(auth)* |

### Mess Pulse
| Method | Path | Description |
|--------|------|-------------|
| POST | `/mess/rate` | Submit meal rating *(auth)* |
| GET | `/mess/week` | Get 7-day average ratings per meal |

### Stats
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Platform statistics |

---

## Production Deployment

1. Set `DATABASE_URL` to a PostgreSQL connection string in your environment.
2. Set `SECRET_KEY` to a long random string.
3. Run with a production ASGI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # App factory, lifespan, router registration
│   ├── db.py            # SQLAlchemy engine, session, Base
│   ├── models.py        # ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── auth.py          # JWT helpers, password hashing, auth dependencies
│   └── routes/
│       ├── __init__.py
│       ├── auth.py      # Signup / Login
│       ├── issues.py    # Issue CRUD
│       ├── votes.py     # Vote toggle
│       ├── comments.py  # Comments
│       ├── admin.py     # Admin endpoints
│       ├── lostfound.py # Lost & Found board
│       └── messpulse.py # Mess ratings
├── requirements.txt
├── .env.example
└── README.md
```
