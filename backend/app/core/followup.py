from datetime import date

FOLLOWUP_STALE_DAYS = 7
DECISION_STALE_DAYS = 3
TERMINAL_STATUSES = {'Rejected', 'Ghosted'}


def _days_since(d: date, today: date) -> int:
    return (today - d).days


def needs_followup(app, today: date) -> bool:
    if str(app.status) in TERMINAL_STATUSES:
        return False
    if app.followed_up_at is not None:
        return False
    last_activity = app.updated_at.date() if app.updated_at else app.applied_date
    return _days_since(last_activity, today) >= FOLLOWUP_STALE_DAYS


def awaiting_response(app, today: date) -> bool:
    if str(app.status) in TERMINAL_STATUSES:
        return False
    if app.followed_up_at is None:
        return False
    return _days_since(app.followed_up_at, today) < DECISION_STALE_DAYS


def needs_decision(app, today: date) -> bool:
    if str(app.status) in TERMINAL_STATUSES:
        return False
    if app.followed_up_at is None:
        return False
    return _days_since(app.followed_up_at, today) >= DECISION_STALE_DAYS


def classify(app, today: date) -> str:
    """Returns 'needs_followup' | 'awaiting_response' | 'needs_decision' | 'ok'."""
    if needs_decision(app, today):
        return 'needs_decision'
    if awaiting_response(app, today):
        return 'awaiting_response'
    if needs_followup(app, today):
        return 'needs_followup'
    return 'ok'
