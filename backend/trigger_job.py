#!/usr/bin/env python3
"""CLI tool to manually trigger any scheduled job for testing/debugging.

Usage:
    python trigger_job.py <job>

Available jobs:
    daily-reminder    8 PM daily reminder
    streak-check      Midnight streak check (notifies mentors)
    weekly-summary    Sunday weekly summary to mentors
    followup-digest   Morning followup digest (apps needing action)
    test-email        Send a sample followup digest with dummy data
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

JOBS = {
    "daily-reminder": "job_daily_reminder",
    "streak-check": "job_streak_check",
    "weekly-summary": "job_weekly_summary",
    "followup-digest": "job_followup_digest",
}


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    job_name = sys.argv[1]

    if job_name == "test-email":
        from app.core.email import notify_followup_digest
        notify_followup_digest(
            user_name="Test User",
            needs_followup=[
                {"company": "Acme Corp", "position": "Software Engineer", "status": "Applied", "days_stale": 10},
                {"company": "Beta Inc", "position": "Backend Developer", "status": "Replied", "days_stale": 8},
            ],
            needs_decision=[
                {"company": "Gamma LLC", "position": "Full Stack Dev", "followed_up_days_ago": 4},
            ],
        )
        print("Done.")
        return

    if job_name not in JOBS:
        print(f"Unknown job: {job_name!r}")
        print(f"Available: {', '.join(JOBS)} test-email")
        sys.exit(1)

    fn_name = JOBS[job_name]
    from app.core import scheduler as sched
    fn = getattr(sched, fn_name)
    fn()
    print("Done.")


if __name__ == "__main__":
    main()
