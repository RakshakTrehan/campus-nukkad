# 🏛️ Campus Nukkad

> **Digital Campus Notice Board & Facilities Transparency Portal**  
> *Report problems, upvote critical campus issues, and watch things get fixed in real time.*

[![Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy-D71F00?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Frontend%20Host-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend%20Host-Render-46E3B7?style=flat&logo=render&logoColor=white)](https://render.com/)

---

## 🌐 Live Deployments

- **🖥️ Live Web App:** [https://campus-nukkad.vercel.app](https://campus-nukkad.vercel.app)
- **⚙️ Backend API:** [https://campus-nukkad-backend.onrender.com](https://campus-nukkad-backend.onrender.com)
- **📖 Interactive API Docs (Swagger):** [https://campus-nukkad-backend.onrender.com/docs](https://campus-nukkad-backend.onrender.com/docs)

---

## 📌 Problem & Solution

Students constantly face broken fans, leaking taps, erratic Wi-Fi, or poor mess food, yet traditional complaint registers get buried and lack accountability. 

**Campus Nukkad** transforms campus operations into an open, democratic digital notice board:
- **Community Pressure & Upvoting:** Issues are public and ranked by student upvotes so critical problems rise to the top.
- **Transparent Status Trail:** Every issue tracks milestones (`REPORTED` ➔ `SEEN` ➔ `IN PROGRESS` ➔ `RESOLVED`) with official admin remarks.
- **Administrative Empowerment:** College maintenance staff manage, prioritize, and post official updates via a dedicated dashboard.
- **Campus Daily Life Add-ons:** Centralized Lost & Found board and a daily Mess Pulse dining satisfaction tracker.

---

## ✨ Features

### 1. 📢 Hero: Campus Issue Wall
- **Submit Reports in 30 Seconds:** Category, specific campus building/room, detailed description, and optional photo URL.
- **1-Click Upvote System:** Students vouch for recurring campus issues with duplicate vote prevention.
- **Categorization & Filters:** Instant sorting by Most Recent or Most Upvoted; filter by *Electrical, Plumbing, Wi-Fi, Cleanliness, Furniture, or Other*.
- **Official Audit Timeline:** Chronological trail of administrative actions and notes on every issue.
- **Discussion Thread:** Community comments for updates, confirmations, or additional details.

### 2. 🔍 Campus Lost & Found Directory
- Community-driven registry of misplaced and retrieved items.
- Real-time status tags (`Awaiting Owner` / `Returned to Owner`).
- Direct claim workflow for students to recover lost belongings.

### 3. 🍽️ Daily Mess Pulse
- Daily 5-star rating for Breakfast, Lunch, and Dinner.
- Interactive **7-Day Trend Chart** powered by Recharts tracking student dining satisfaction over time.

### 4. 🛠️ Administrative Portal
- Real-time sorting by student upvote count to prioritize emergency repairs.
- Instant milestone switcher with audit log notes.
- One-click demo database seed endpoint (`POST /admin/seed`).

---

## 🏗️ Architecture & Tech Stack

```
               [ Browser / Mobile Client ]
                           │
                           ▼
          React 18 + Vite Frontend (Vercel)
          Tailwind CSS (Institutional Theme)
                           │
                   HTTPS / REST API
                           │
                           ▼
             FastAPI Backend (Render)
         JWT Auth · Pydantic v2 · ORM
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    PostgreSQL (Neon / Cloud)      SQLite (Local Dev)
```

- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Axios, Recharts, Plus Jakarta Sans & Inter typography.
- **Backend:** FastAPI (Python), Uvicorn ASGI, SQLAlchemy 2.0 ORM, Pydantic v2, Python-Jose (JWT), Passlib / Bcrypt.
- **Database:** PostgreSQL (Production on Neon.tech) / SQLite (`campus_nukkad.db` for instant zero-setup local dev).

---

## 📁 Repository Structure

```
campus-nukkad/
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── api/                  # Axios API integration modules
│   │   ├── components/           # Reusable UI components (Navbar, Cards, Badges)
│   │   ├── context/              # AuthContext (JWT & state management)
│   │   ├── pages/                # Home, IssueDetail, Report, Admin, LostFound, MessPulse, Auth
│   │   ├── App.jsx               # Router & ErrorBoundary configuration
│   │   ├── index.css             # Base styles & theme tokens
│   │   └── main.jsx              # React DOM entry
│   ├── tailwind.config.js        # Custom design tokens
│   ├── vercel.json               # SPA routing rewrite rules for Vercel
│   └── package.json
│
├── backend/                      # FastAPI Python application
│   ├── app/
│   │   ├── routes/               # API endpoints (auth, issues, votes, comments, admin, etc.)
│   │   ├── auth.py               # JWT generation & authentication dependencies
│   │   ├── db.py                 # SQLAlchemy engine & session factory
│   │   ├── models.py             # Database models (User, Issue, Vote, Comment, etc.)
│   │   ├── schemas.py            # Pydantic request/response validation
│   │   ├── seed_data.py          # Production demo data populator
│   │   └── main.py               # App lifecycle, CORS & route registry
│   ├── requirements.txt          # Python dependencies
│   ├── seed.py                   # Local CLI data seed script
│   └── .env.example              # Environment variables template
│
├── render.yaml                   # Infrastructure-as-code deployment for Render
└── README.md
```

---

## 🚀 Quickstart: Local Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/RakshakTrehan/campus-nukkad.git
cd campus-nukkad
```

---

### 2. Run the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (defaults to SQLite local database)
copy .env.example .env     # Windows
# cp .env.example .env     # macOS / Linux

# Seed realistic demo data
python seed.py

# Start FastAPI server
uvicorn app.main:app --port 8000 --reload
```

Backend will be running at **`http://127.0.0.1:8000`** (Swagger docs: **`http://127.0.0.1:8000/docs`**).

---

### 3. Run the Frontend

Open a new terminal window:

```bash
cd campus-nukkad/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will be live at **`http://127.0.0.1:5173`**.

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Campus Admin** | `admin@campus.edu` | `admin123` | Full administrative control, status management & official notes |
| **Student** | `arjun@campus.edu` | `pass1234` | Issue reporting, upvoting, comments & meal ratings |
| **Student** | `priya@campus.edu` | `pass1234` | Multi-user test account |

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/signup` | Register new student account | No |
| `POST` | `/auth/login` | Authenticate and obtain JWT Bearer token | No |
| `GET` | `/issues` | List issues (with category, location, and sorting filters) | Optional |
| `POST` | `/issues` | Submit a new issue report | **Yes** |
| `GET` | `/issues/{id}` | Detailed issue information, status history, and comments | Optional |
| `POST` | `/issues/{id}/vote` | Toggle upvote on an issue | **Yes** |
| `POST` | `/issues/{id}/comments` | Post comment to discussion thread | **Yes** |
| `GET` | `/admin/issues` | Administrative view of all campus issues | **Admin** |
| `PATCH`| `/admin/issues/{id}/status` | Update issue milestone status & attach note | **Admin** |
| `POST` | `/admin/seed` | Populate database with realistic demo data | **Admin** |
| `GET` | `/lostfound` | List lost and retrieved property items | No |
| `POST` | `/lostfound` | Register a retrieved item | **Yes** |
| `PATCH`| `/lostfound/{id}/claim` | Mark item as claimed | **Yes** |
| `POST` | `/mess/rate` | Submit daily meal rating (1–5 stars) | **Yes** |
| `GET` | `/mess/week` | Retrieve 7-day dining quality trend metrics | No |
| `GET` | `/stats` | Platform-wide resolved, open, and total counters | No |

---

## ☁️ Deployment Guide

### Backend on Render
1. Create a free PostgreSQL instance on **[Neon.tech](https://neon.tech)** and copy the connection string.
2. Link your GitHub repo to **[Render.com](https://render.com)** as a **Web Service**.
3. Set **Root Directory:** `backend`, **Build Command:** `pip install -r requirements.txt`, **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Configure Environment Variables:
   - `DATABASE_URL`: *your Neon PostgreSQL connection string*
   - `SECRET_KEY`: *random 32+ character string*
   - `PYTHON_VERSION`: `3.11.9`

### Frontend on Vercel
1. Import repository on **[Vercel.com](https://vercel.com)**.
2. Set **Root Directory:** `frontend`.
3. Configure Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
4. Deploy!

---

## 📜 License
Distributed under the MIT License. Built with ❤️ for campus betterment.
