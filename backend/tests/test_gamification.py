from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

from app.core.gamification import add_points


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


def test_first_activity_starts_streak():
    user = make_user(current_streak=0, updated_at=None)
    add_points(MagicMock(), user, points=10, reason="test")
    assert user.current_streak == 1


def test_same_day_streak_unchanged():
    user = make_user(current_streak=3, updated_at=datetime.now(timezone.utc))
    add_points(MagicMock(), user, points=10, reason="test")
    assert user.current_streak == 3


def test_consecutive_day_increments_streak():
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    user = make_user(current_streak=3, updated_at=yesterday)
    add_points(MagicMock(), user, points=10, reason="test")
    assert user.current_streak == 4


def test_gap_resets_streak():
    two_days_ago = datetime.now(timezone.utc) - timedelta(days=2)
    user = make_user(current_streak=5, updated_at=two_days_ago)
    add_points(MagicMock(), user, points=10, reason="test")
    assert user.current_streak == 1


def test_longest_streak_updates_when_beaten():
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    user = make_user(current_streak=5, longest_streak=5, updated_at=yesterday)
    add_points(MagicMock(), user, points=10, reason="test")
    assert user.longest_streak == 6
