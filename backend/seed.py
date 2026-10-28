"""
seed.py — Seeds Campus Nukkad with realistic demo data.
Run after the backend venv is set up:
    python seed.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta, date as date_type
import random

# Bootstrap the app context
from app.db import SessionLocal, engine
from app import models
from app.auth import hash_password

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

def clear():
    db.query(models.MessRating).delete()
    db.query(models.LostFound).delete()
    db.query(models.StatusUpdate).delete()
    db.query(models.Comment).delete()
    db.query(models.Vote).delete()
    db.query(models.Issue).delete()
    db.query(models.User).delete()
    db.commit()
    print("🗑  Cleared existing data")

def seed():
    clear()

    # ── Users ───────────────────────────────────────────────────────────────
    users_data = [
        ("Campus Admin",   "admin@campus.edu",   "admin123",  "admin"),
        ("Arjun Sharma",   "arjun@campus.edu",   "pass1234",  "student"),
        ("Priya Mehta",    "priya@campus.edu",   "pass1234",  "student"),
        ("Rohan Verma",    "rohan@campus.edu",   "pass1234",  "student"),
        ("Sneha Iyer",     "sneha@campus.edu",   "pass1234",  "student"),
        ("Dev Kapoor",     "dev@campus.edu",     "pass1234",  "student"),
        ("Aisha Khan",     "aisha@campus.edu",   "pass1234",  "student"),
        ("Tanveer Singh",  "tanveer@campus.edu", "pass1234",  "student"),
    ]
    users = []
    for name, email, pw, role in users_data:
        u = models.User(name=name, email=email, hashed_password=hash_password(pw), role=role)
        db.add(u)
        users.append(u)
    db.commit()
    for u in users: db.refresh(u)
    admin, arjun, priya, rohan, sneha, dev, aisha, tanveer = users
    students = users[1:]
    print(f"✅ Seeded {len(users)} users")

    # ── Issues ──────────────────────────────────────────────────────────────
    issues_data = [
        # (title, desc, category, location, status, photo_url, days_ago, creator)
        ("Fan in Hostel B, Room 214 not working since Monday",
         "The ceiling fan has completely stopped. It's been 4 days and the room is unbearable without it. Please fix ASAP.",
         "electrical", "Hostel B, Room 214", "in_progress", None, 5, arjun),

        ("Wi-Fi dead near Library Annex — entire east wing",
         "No Wi-Fi signal anywhere in the east wing of the library since Tuesday morning. Affects at least 60 students during exam prep.",
         "wifi", "Library, East Wing", "seen", None, 3, priya),

        ("Water cooler on 2nd floor, Block C leaking badly",
         "The water cooler has been leaking since last week. The floor is slippery and dangerous. Someone almost fell yesterday.",
         "plumbing", "Block C, 2nd Floor Corridor", "reported", None, 7, rohan),

        ("Broken desk and chair in Lab 3, CS Department",
         "Two desks are completely broken — one leg is missing on each. Students are sitting on the floor.",
         "furniture", "CS Department, Lab 3", "fixed", None, 14, sneha),

        ("Lights not working in Hostel A common room",
         "3 out of 5 tube lights in the Hostel A common room are dead. Very dim at night. Students can't study there.",
         "electrical", "Hostel A, Common Room", "reported", None, 2, dev),

        ("Drainage blocked outside Canteen — smells terrible",
         "The drainage near the canteen entrance is clogged. It smells really bad and attracts mosquitoes. Health hazard.",
         "plumbing", "Main Canteen, North Entrance", "in_progress", None, 6, aisha),

        ("Wi-Fi in Hostel C rooms 301–320 extremely slow",
         "Download speeds are under 0.5 Mbps in this block. Can't even load Google Meet for online classes.",
         "wifi", "Hostel C, Rooms 301-320", "reported", None, 1, tanveer),

        ("Broken window pane in Seminar Hall 2",
         "One of the window panes has shattered. Glass pieces are on the floor. Risk of injury.",
         "furniture", "Seminar Hall 2", "seen", None, 4, arjun),

        ("Geyser in Hostel B boys' bathroom not working",
         "The geyser has been off since Friday. Cold showers in October are not okay. Please fix urgently.",
         "electrical", "Hostel B, Boys Bathroom Block 2", "fixed", None, 10, priya),

        ("Drinking water tap broken in Block D ground floor",
         "The tap handle broke off. Water flows continuously and is wasted. Also can't drink from it.",
         "plumbing", "Block D, Ground Floor", "reported", None, 1, rohan),

        ("Classroom AC in Room 101 leaking water",
         "The AC drips water onto students sitting in the front row. Books and bags are getting wet.",
         "electrical", "Block A, Room 101", "seen", None, 3, sneha),

        ("Footpath near Sports Ground full of potholes",
         "The walkway to the sports ground is broken with large potholes. Very difficult to walk at night.",
         "cleanliness", "Sports Ground Pathway", "reported", None, 8, dev),
    ]

    issues = []
    now = datetime.utcnow()
    for title, desc, cat, loc, status, photo, days_ago, creator in issues_data:
        issue = models.Issue(
            title=title, description=desc, category=cat,
            location=loc, status=status, photo_url=photo,
            created_by=creator.id,
            created_at=now - timedelta(days=days_ago),
        )
        db.add(issue)
        issues.append(issue)
    db.commit()
    for i in issues: db.refresh(i)
    print(f"✅ Seeded {len(issues)} issues")

    # ── Votes ───────────────────────────────────────────────────────────────
    vote_pairs = set()
    for issue in issues:
        # Randomly assign 3–8 voters per issue
        voters = random.sample(students, min(random.randint(3, 7), len(students)))
        for voter in voters:
            key = (issue.id, voter.id)
            if key not in vote_pairs:
                vote_pairs.add(key)
                db.add(models.Vote(issue_id=issue.id, user_id=voter.id))
                issue.vote_count += 1
    db.commit()
    print(f"✅ Seeded {len(vote_pairs)} votes")

    # ── Comments ─────────────────────────────────────────────────────────────
    comments_data = [
        (issues[0], arjun,   "Reported to the hostel warden on Day 1. Still no response."),
        (issues[0], priya,   "My room is next door and it's the same situation. Please fix both!"),
        (issues[0], admin,   "Electrician has been notified. Will visit tomorrow morning."),
        (issues[1], rohan,   "Confirmed — can't use Teams for group project calls. Horrible timing before internals."),
        (issues[1], sneha,   "Affects the reading room too. All 40 seats there are unusable."),
        (issues[2], dev,     "I slipped near this yesterday. Please mark the floor with a warning sign at least."),
        (issues[4], aisha,   "Same issue in the hostel D common room. Seems to be a wider problem."),
        (issues[6], tanveer, "Speed test shows 0.3 Mbps. Barely loads a text page."),
        (issues[9], rohan,   "The water is overflowing into the corridor now."),
        (issues[11], sneha,  "I walk this path every morning. Really need it fixed before the rains."),
    ]
    for issue, user, text in comments_data:
        db.add(models.Comment(issue_id=issue.id, user_id=user.id, text=text,
                              created_at=issue.created_at + timedelta(hours=random.randint(1,24))))
    db.commit()
    print(f"✅ Seeded {len(comments_data)} comments")

    # ── Status Updates (timeline) ────────────────────────────────────────────
    status_updates = [
        # Fixed issues get a full timeline
        (issues[3], "seen",        "Noted by facilities team.",          1),
        (issues[3], "in_progress", "Replacement desks ordered.",         3),
        (issues[3], "fixed",       "New desks installed in Lab 3. Done!",14),
        (issues[8], "seen",        "Electrician informed.",              1),
        (issues[8], "in_progress", "Part ordered for geyser.",           3),
        (issues[8], "fixed",       "Geyser repaired and tested.",        10),
        # In-progress issues
        (issues[0], "seen",        "Warden has acknowledged the complaint.", 2),
        (issues[0], "in_progress", "Electrician scheduled for tomorrow.",    4),
        (issues[5], "seen",        "Received by maintenance.",              1),
        (issues[5], "in_progress", "Drain cleaning crew dispatched.",       5),
        # Seen issues
        (issues[1], "seen",        "IT team is investigating.",             1),
        (issues[7], "seen",        "Logged by admin office.",               1),
        (issues[10],"seen",        "AC technician has been called.",        1),
    ]
    for issue, status, note, days_after in status_updates:
        db.add(models.StatusUpdate(
            issue_id=issue.id, status=status, note=note,
            updated_by=admin.id,
            created_at=issue.created_at + timedelta(days=days_after),
        ))
    db.commit()
    print(f"✅ Seeded {len(status_updates)} status updates")

    # ── Lost & Found ─────────────────────────────────────────────────────────
    lf_data = [
        ("Blue Wildcraft Backpack", "Blue medium-sized backpack with a broken zipper on side pocket. Has a water bottle holder.", "Library Reading Room, Table 12", False, arjun),
        ("JBL Earphones (black)", "JBL wired earphones in black. Found on a bench outside canteen.", "Main Canteen, Outdoor Bench", True, priya),
        ("Student ID Card — Ananya Rao", "Found ID card for Ananya Rao, 3rd year ECE. Please collect from hostel office.", "Hostel B Corridor", False, rohan),
        ("Casio Scientific Calculator", "Casio fx-991EX. Found in classroom after a lab session.", "Block C, Lab 2", False, sneha),
        ("Red umbrella", "Bright red compact umbrella. Found near the main gate.", "Main Gate, Security Cabin", False, dev),
        ("Phone charger — Type C", "White Type-C charger, 65W. Found in seminar hall.", "Seminar Hall 1", True, aisha),
    ]
    for item_name, desc, loc, claimed, finder in lf_data:
        db.add(models.LostFound(
            item_name=item_name, description=desc,
            found_location=loc, claimed=claimed,
            found_by=finder.id,
            created_at=now - timedelta(days=random.randint(1, 10)),
        ))
    db.commit()
    print(f"✅ Seeded {len(lf_data)} lost & found items")

    # ── Mess Ratings ─────────────────────────────────────────────────────────
    today = date_type.today()
    for day_offset in range(7):
        day = today - timedelta(days=day_offset)
        for meal in ["breakfast", "lunch", "dinner"]:
            raters = random.sample(students, random.randint(3, 6))
            for rater in raters:
                # Skip if already exists (shouldn't happen in clean seed)
                existing = db.query(models.MessRating).filter(
                    models.MessRating.user_id == rater.id,
                    models.MessRating.meal_type == meal,
                    models.MessRating.date == day,
                ).first()
                if not existing:
                    # Lunch is generally better rated
                    if meal == "lunch":
                        rating = random.choices([3, 4, 5], weights=[1, 3, 2])[0]
                    elif meal == "breakfast":
                        rating = random.choices([2, 3, 4], weights=[2, 3, 1])[0]
                    else:
                        rating = random.choices([2, 3, 4, 5], weights=[1, 2, 3, 1])[0]
                    db.add(models.MessRating(
                        meal_type=meal, rating=rating,
                        date=day, user_id=rater.id,
                    ))
    db.commit()
    print("✅ Seeded 7 days of mess ratings")

    print("\n🎉 Database seeded! Summary:")
    print(f"   Users:           {db.query(models.User).count()}")
    print(f"   Issues:          {db.query(models.Issue).count()}")
    print(f"   Votes:           {db.query(models.Vote).count()}")
    print(f"   Comments:        {db.query(models.Comment).count()}")
    print(f"   Status Updates:  {db.query(models.StatusUpdate).count()}")
    print(f"   Lost & Found:    {db.query(models.LostFound).count()}")
    print(f"   Mess Ratings:    {db.query(models.MessRating).count()}")
    print("\n🔑 Admin login: admin@campus.edu / admin123")
    print("👤 Student login: arjun@campus.edu / pass1234")

if __name__ == "__main__":
    seed()
    db.close()
