from datetime import date, datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from app.core.gamification import add_points

# Fixed reference point: Wednesday 2026-04-29
TODAY = datetime(2026, 4, 29, 10, 0, tzinfo=timezone.utc)
YESTERDAY = datetime(2026, 4, 28, 10, 0)   # Tuesday  (naive, like DB)
TWO_DAYS_AGO = datetime(2026, 4, 27, 10, 0) # Monday   (naive, like DB)


def make_user(current_streak=0, longest_streak=0, updated_at=None):
    return SimpleNamespace(
        id=None,
        current_streak=current_streak,
        longest_streak=longest_streak,
        updated_at=updated_at,
        level=1,
        level_name="Novice Seeker",
        points=0,
        point_history=[],
    )


def run(user, today_dt=TODAY, off_days=None):
    mock_dt = MagicMock()
    mock_dt.now.return_value = today_dt
    with patch("app.core.gamification.datetime", mock_dt), \
         patch("app.core.gamification.load_off_days", return_value=off_days or set()):
        add_points(MagicMock(), user, points=10, reason="test")


# --- first activity ---

def test_first_activity_starts_streak():
    user = make_user(current_streak=0, updated_at=None)
    run(user)
    assert user.current_streak == 1


# --- same day ---

def test_same_day_streak_unchanged():
    user = make_user(current_streak=3, updated_at=datetime(2026, 4, 29, 8, 0))
    run(user)
    assert user.current_streak == 3


# --- consecutive working day ---

def test_consecutive_day_increments_streak():
    user = make_user(current_streak=3, updated_at=YESTERDAY)
    run(user)
    assert user.current_streak == 4


# --- gap with only working days → broken ---

def test_working_day_gap_resets_streak():
    # Monday → Wednesday with Tuesday being a normal working day
    user = make_user(current_streak=5, updated_at=TWO_DAYS_AGO)
    run(user)
    assert user.current_streak == 1


# --- weekend gap ---

def test_weekend_does_not_break_streak():
    # Friday → Monday: only Sat/Sun in between
    friday = datetime(2026, 4, 24, 10, 0)
    monday = datetime(2026, 4, 27, 10, 0, tzinfo=timezone.utc)
    user = make_user(current_streak=3, updated_at=friday)
    run(user, today_dt=monday)
    assert user.current_streak == 4


# --- holiday gap ---

def test_holiday_does_not_break_streak():
    # Thu Apr 2 → Tue Apr 7: Good Friday (Apr 3), weekend, Easter Monday (Apr 6) all off
    thursday = datetime(2026, 4, 2, 10, 0)
    tuesday = datetime(2026, 4, 7, 10, 0, tzinfo=timezone.utc)
    easter_off = {date(2026, 4, 3), date(2026, 4, 6)}
    user = make_user(current_streak=3, updated_at=thursday)
    run(user, today_dt=tuesday, off_days=easter_off)
    assert user.current_streak == 4


# --- leave gap ---

def test_leave_does_not_break_streak():
    # Thu Apr 23 → Mon Apr 27: Friday Apr 24 is a leave, Sat/Sun are weekend
    thursday = datetime(2026, 4, 23, 10, 0)
    monday = datetime(2026, 4, 27, 10, 0, tzinfo=timezone.utc)
    leave_days = {date(2026, 4, 24)}
    user = make_user(current_streak=3, updated_at=thursday)
    run(user, today_dt=monday, off_days=leave_days)
    assert user.current_streak == 4


# --- longest streak ---

def test_longest_streak_updates_when_beaten():
    user = make_user(current_streak=5, longest_streak=5, updated_at=YESTERDAY)
    run(user)
    assert user.longest_streak == 6
