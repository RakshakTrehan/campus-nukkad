"""
seed_data.py — In-app database populator for demo & production environments.
"""

from datetime import datetime, timedelta, date as date_type
import random
from sqlalchemy.orm import Session
from . import models
from .auth import hash_password

def populate_demo_data(db: Session) -> str:
    # 1. Clear existing non-admin data
    db.query(models.MessRating).delete()
    db.query(models.LostFound).delete()
    db.query(models.StatusUpdate).delete()
    db.query(models.Comment).delete()
    db.query(models.Vote).delete()
    db.query(models.Issue).delete()
    db.query(models.User).delete()
    db.commit()

    # 2. Users
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
    for u in users:
        db.refresh(u)
    admin = users[0]
    students = users[1:]

    # 3. Issues
    now = datetime.utcnow()
    issues_data = [
        ("Fan in Hostel B, Room 214 not working since Monday",
         "The ceiling fan has completely stopped. It's been 4 days and the room is unbearable without it. Please fix ASAP.",
         "electrical", "Hostel B, Room 214", "in_progress", 5, students[0]),

        ("Wi-Fi dead near Library Annex — entire east wing",
         "No Wi-Fi signal anywhere in the east wing of the library since Tuesday morning. Affects at least 60 students during exam prep.",
         "wifi", "Library, East Wing", "seen", 3, students[1]),

        ("Water cooler on 2nd floor, Block C leaking badly",
         "The water cooler has been leaking since last week. The floor is slippery and dangerous. Someone almost fell yesterday.",
         "plumbing", "Block C, 2nd Floor Corridor", "reported", 7, students[2]),

        ("Broken desk and chair in Lab 3, CS Department",
         "Two desks are completely broken — one leg is missing on each. Students are sitting on the floor.",
         "furniture", "CS Department, Lab 3", "fixed", 14, students[3]),

        ("Lights not working in Hostel A common room",
         "3 out of 5 tube lights in the Hostel A common room are dead. Very dim at night. Students can't study there.",
         "electrical", "Hostel A, Common Room", "reported", 2, students[4]),

        ("Drainage blocked outside Canteen — smells terrible",
         "The drainage near the canteen entrance is clogged. It smells really bad and attracts mosquitoes. Health hazard.",
         "plumbing", "Main Canteen, North Entrance", "in_progress", 6, students[5]),

        ("Wi-Fi in Hostel C rooms 301–320 extremely slow",
         "Download speeds are under 0.5 Mbps in this block. Can't even load Google Meet for online classes.",
         "wifi", "Hostel C, Rooms 301-320", "reported", 1, students[6]),

        ("Broken window pane in Seminar Hall 2",
         "One of the window panes has shattered. Glass pieces are on the floor. Risk of injury.",
         "furniture", "Seminar Hall 2", "seen", 4, students[0]),

        ("Geyser in Hostel B boys' bathroom not working",
         "The geyser has been off since Friday. Cold showers in October are not okay. Please fix urgently.",
         "electrical", "Hostel B, Boys Bathroom Block 2", "fixed", 10, students[1]),

        ("Drinking water tap broken in Block D ground floor",
         "The tap handle broke off. Water flows continuously and is wasted. Also can't drink from it.",
         "plumbing", "Block D, Ground Floor", "reported", 1, students[2]),

        ("Classroom AC in Room 101 leaking water",
         "The AC drips water onto students sitting in the front row. Books and bags are getting wet.",
         "electrical", "Block A, Room 101", "seen", 3, students[3]),

        ("Footpath near Sports Ground full of potholes",
         "The walkway to the sports ground is broken with large potholes. Very difficult to walk at night.",
         "cleanliness", "Sports Ground Pathway", "reported", 8, students[4]),
    ]

    issues = []
    for title, desc, cat, loc, status, days_ago, creator in issues_data:
        issue = models.Issue(
            title=title, description=desc, category=cat,
            location=loc, status=status,
            created_by=creator.id,
            created_at=now - timedelta(days=days_ago),
        )
        db.add(issue)
        issues.append(issue)
    db.commit()
    for i in issues:
        db.refresh(i)

    # 4. Votes
    for issue in issues:
        sample_size = min(random.randint(3, 7), len(students))
        voters = random.sample(students, sample_size)
        for voter in voters:
            db.add(models.Vote(issue_id=issue.id, user_id=voter.id))
            issue.vote_count += 1
    db.commit()

    # 5. Comments
    comments_data = [
        (issues[0], students[0], "Reported to the hostel warden on Day 1. Still no response."),
        (issues[0], students[1], "My room is next door and it's the same situation. Please fix both!"),
        (issues[0], admin,       "Electrician has been notified. Will visit tomorrow morning."),
        (issues[1], students[2], "Confirmed — can't use Teams for group project calls. Horrible timing."),
        (issues[1], students[3], "Affects the reading room too. All 40 seats there are unusable."),
        (issues[2], students[4], "I slipped near this yesterday. Please mark the floor with a warning sign."),
        (issues[4], students[5], "Same issue in the hostel D common room. Seems to be a wider problem."),
        (issues[6], students[6], "Speed test shows 0.3 Mbps. Barely loads a text page."),
        (issues[9], students[2], "The water is overflowing into the corridor now."),
        (issues[11], students[3],"I walk this path every morning. Really need it fixed before the rains."),
    ]
    for issue, user, text in comments_data:
        db.add(models.Comment(
            issue_id=issue.id, user_id=user.id, text=text,
            created_at=issue.created_at + timedelta(hours=random.randint(1, 24)),
        ))
    db.commit()

    # 6. Status Updates
    status_updates = [
        (issues[3], "seen",        "Noted by facilities team.",           1),
        (issues[3], "in_progress", "Replacement desks ordered.",          3),
        (issues[3], "fixed",       "New desks installed in Lab 3. Done!", 14),
        (issues[8], "seen",        "Electrician informed.",               1),
        (issues[8], "in_progress", "Part ordered for geyser.",            3),
        (issues[8], "fixed",       "Geyser repaired and tested.",         10),
        (issues[0], "seen",        "Warden has acknowledged complaint.",  2),
        (issues[0], "in_progress", "Electrician scheduled for tomorrow.", 4),
        (issues[5], "seen",        "Received by maintenance.",            1),
        (issues[5], "in_progress", "Drain cleaning crew dispatched.",     5),
        (issues[1], "seen",        "IT team is investigating.",           1),
        (issues[7], "seen",        "Logged by admin office.",             1),
        (issues[10], "seen",       "AC technician has been called.",      1),
    ]
    for issue, status, note, days_after in status_updates:
        db.add(models.StatusUpdate(
            issue_id=issue.id, status=status, note=note,
            updated_by=admin.id,
            created_at=issue.created_at + timedelta(days=days_after),
        ))
    db.commit()

    # 7. Lost & Found
    lf_data = [
        ("Blue Wildcraft Backpack", "Blue medium-sized backpack with a broken zipper on side pocket.", "Library Reading Room, Table 12", False, students[0]),
        ("JBL Earphones (black)", "JBL wired earphones in black. Found on a bench outside canteen.", "Main Canteen, Outdoor Bench", True, students[1]),
        ("Student ID Card — Ananya Rao", "Found ID card for Ananya Rao, 3rd year ECE. Please collect from hostel office.", "Hostel B Corridor", False, students[2]),
        ("Casio Scientific Calculator", "Casio fx-991EX. Found in classroom after a lab session.", "Block C, Lab 2", False, students[3]),
        ("Red umbrella", "Bright red compact umbrella. Found near the main gate.", "Main Gate, Security Cabin", False, students[4]),
        ("Phone charger — Type C", "White Type-C charger, 65W. Found in seminar hall.", "Seminar Hall 1", True, students[5]),
    ]
    for item_name, desc, loc, claimed, finder in lf_data:
        db.add(models.LostFound(
            item_name=item_name, description=desc,
            found_location=loc, claimed=claimed,
            found_by=finder.id,
            created_at=now - timedelta(days=random.randint(1, 10)),
        ))
    db.commit()

    # 8. Mess Ratings
    today = date_type.today()
    for day_offset in range(7):
        day = today - timedelta(days=day_offset)
        for meal in ["breakfast", "lunch", "dinner"]:
            raters = random.sample(students, random.randint(3, 6))
            for rater in raters:
                existing = db.query(models.MessRating).filter(
                    models.MessRating.user_id == rater.id,
                    models.MessRating.meal_type == meal,
                    models.MessRating.date == day,
                ).first()
                if not existing:
                    rating = 4 if meal == "lunch" else (3 if meal == "breakfast" else 4)
                    db.add(models.MessRating(
                        meal_type=meal, rating=rating,
                        date=day, user_id=rater.id,
                    ))
    db.commit()

    return f"Seeded {len(users)} users, {len(issues)} issues, 6 lost items, 7 days mess ratings."
