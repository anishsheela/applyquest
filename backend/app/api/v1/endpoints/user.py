from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import user as user_model
from app.schemas import user as user_schema

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=user_schema.User)
def read_user(db: Session = Depends(get_db)) -> Any:
    """
    Get current user.
    """
    # Simply get the first user for now as we are single user
    user = db.query(user_model.User).first()
    if not user:
        # Create default user if not exists
        user = user_model.User(
            name="Default User",
            email="user@example.com",
            level_name="Novice"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.put("/", response_model=user_schema.User)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_in: user_schema.UserUpdate,
) -> Any:
    """
    Update current user.
    """
    user = db.query(user_model.User).first()
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
