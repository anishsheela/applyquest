from datetime import date
from app.core.working_days import _is_off_day, streak_is_unbroken

# Mondays in 2026 for easy reference
MON = date(2026, 4, 27)
TUE = date(2026, 4, 28)
WED = date(2026, 4, 29)
THU = date(2026, 4, 30)
FRI = date(2026, 4, 24)
SAT = date(2026, 4, 25)
SUN = date(2026, 4, 26)


# --- _is_off_day ---

def test_saturday_is_off():
    assert _is_off_day(SAT, set()) is True

def test_sunday_is_off():
    assert _is_off_day(SUN, set()) is True

def test_monday_is_working():
    assert _is_off_day(MON, set()) is False

def test_holiday_is_off():
    assert _is_off_day(MON, {MON}) is True


# --- streak_is_unbroken ---

def test_consecutive_days_unbroken():
    assert streak_is_unbroken(TUE, WED, set()) is True

def test_friday_to_monday_unbroken():
    # Saturday and Sunday are weekends — no working day missed
    assert streak_is_unbroken(FRI, MON, set()) is True

def test_two_weekday_gap_broken():
    # Monday → Wednesday: Tuesday is a working day in between
    assert streak_is_unbroken(MON, WED, set()) is False

def test_holiday_fills_gap():
    # Monday → Wednesday: Tuesday is a holiday → unbroken
    assert streak_is_unbroken(MON, WED, {TUE}) is True

def test_leave_fills_gap():
    # Thursday → Monday: Friday is a leave, Sat/Sun are weekend → unbroken
    assert streak_is_unbroken(THU, MON, {FRI}) is True

def test_partial_holiday_still_broken():
    # Monday → Thursday: Tuesday is holiday, Wednesday is not → broken
    assert streak_is_unbroken(MON, THU, {TUE}) is False
