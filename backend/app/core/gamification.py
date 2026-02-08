from datetime import datetime, timedelta
from app.models.user import User
from app.models.point_history import PointHistory
from sqlalchemy.orm import Session
from uuid import UUID

LEVELS = [
    {"level": 1, "name": "Novice Seeker", "minPoints": 0},
    {"level": 2, "name": "Active Applicant", "minPoints": 100},
    {"level": 3, "name": "Job Hunter", "minPoints": 300},
    {"level": 4, "name": "Networking Pro", "minPoints": 600},
    {"level": 5, "name": "Interview Master", "minPoints": 1000},
    {"level": 6, "name": "Offer Magnet", "minPoints": 1500},
]

def add_points(
    db: Session,
    user: User,
    points: int,
    reason: str,
    reference_type: str = None,
    reference_id: UUID = None
):
    """
    Add points to user via PointHistory for audit trail.
    This creates a point history record and updates user level/streak.
    The caller is responsible for committing the transaction.
    """
    # Create point history record
    point_record = PointHistory(
        user_id=user.id,
        points=points,
        reason=reason,
        reference_type=reference_type,
        reference_id=reference_id
    )
    db.add(point_record)
    
    # Refresh user to get updated points from relationship
    db.flush()  # Ensure point_record is in session
    db.refresh(user)
    
    # Calculate Level based on total points
    for level_data in LEVELS:
        if user.points >= level_data["minPoints"]:
            user.level = level_data["level"]
            user.level_name = level_data["name"]
    
    # Update Streak
    now = datetime.utcnow()
    today = now.date()
    
    if not user.updated_at:
        user.current_streak = 1
        user.longest_streak = 1
    else:
        last_active_date = user.updated_at.date()
        
        if last_active_date == today:
            # Already active today, streak unchanged
            pass
        elif last_active_date == today - timedelta(days=1):
            # Active yesterday, streak continues
            user.current_streak += 1
        else:
            # Broken streak - reset to 1
            user.current_streak = 1
            
        # Update longest streak
        if user.current_streak > user.longest_streak:
            user.longest_streak = user.current_streak
    
    db.add(user)
    return user


# Legacy function for backward compatibility - deprecated
def update_user_stats(user: User, points_to_add: int):
    """
    DEPRECATED: Use add_points() instead.
    This function is kept for backward compatibility but doesn't create audit trail.
    """
    # This will be replaced in endpoint calls
    pass
