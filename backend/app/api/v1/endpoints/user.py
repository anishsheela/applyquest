from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models import user as user_model
from app.schemas import user as user_schema

router = APIRouter()

@router.get("/", response_model=user_schema.User)
def read_user(
    current_user: user_model.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/", response_model=user_schema.User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: user_schema.UserUpdate,
    current_user: user_model.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update current user.
    """
    user = current_user
    
    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
