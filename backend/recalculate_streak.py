#!/usr/bin/env python3
"""Recalculate streak from point history and update the user record.

Usage (from project root):
    docker compose exec backend python recalculate_streak.py
"""
from datetime import datetime, timezone

# Import all models so SQLAlchemy can resolve relationships before querying
import app.models.application  # noqa: F401
import app.models.network  # noqa: F401
import app.models.point_history  # noqa: F401
import app.models.user  # noqa: F401

from app.core.working_days import load_off_days, streak_is_unbroken
from app.db.session import SessionLocal
from app.models.point_history import PointHistory
from app.models.user import User


def recalculate():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            print("No user found in database.")
            return

        records = (
            db.query(PointHistory)
            .filter(PointHistory.user_id == user.id)
            .order_by(PointHistory.created_at)
            .all()
        )

        activity_dates = sorted(set(r.created_at.date() for r in records))

        if not activity_dates:
            print("No activity found. Resetting streak to 0.")
            user.current_streak = 0
            user.longest_streak = 0
            db.commit()
            return

        # Walk activity dates and recompute streak
        off_days = load_off_days()
        current_streak = 1
        longest_streak = 1

        for i in range(1, len(activity_dates)):
            if streak_is_unbroken(activity_dates[i - 1], activity_dates[i], off_days):
                current_streak += 1
            else:
                current_streak = 1
            if current_streak > longest_streak:
                longest_streak = current_streak

        # Check if the streak is still alive today
        today = datetime.now(timezone.utc).date()
        last_active = activity_dates[-1]

        if last_active < today and not streak_is_unbroken(last_active, today, off_days):
            print(f"Streak broken: no activity since {last_active} with a missed working day.")
            current_streak = 0

        old_current = user.current_streak
        old_longest = user.longest_streak
        user.current_streak = current_streak
        user.longest_streak = max(longest_streak, old_longest)

        db.commit()

        print(f"User:           {user.name} ({user.email})")
        print(f"Activity:       {len(activity_dates)} days  ({activity_dates[0]} → {last_active})")
        print(f"Current streak: {old_current} → {user.current_streak}")
        print(f"Longest streak: {old_longest} → {user.longest_streak}")

    finally:
        db.close()


if __name__ == "__main__":
    recalculate()
