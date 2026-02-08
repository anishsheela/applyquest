from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    name: str
    email: EmailStr
    current_education: Optional[str] = None
    german_level: Optional[str] = None
    current_role: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class User(UserBase):
    id: UUID
    points: int
    level: int
    level_name: str
    current_streak: int
    longest_streak: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
