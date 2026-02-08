from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from uuid import UUID

class NetworkContactBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    relationship_type: Optional[str] = None
    connection_strength: int = 1
    last_contact_date: Optional[date] = None
    notes: Optional[str] = None
    application_id: Optional[UUID] = None

class NetworkContactCreate(NetworkContactBase):
    pass

class NetworkContactUpdate(NetworkContactBase):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    relationship_type: Optional[str] = None
    connection_strength: Optional[int] = None
    last_contact_date: Optional[date] = None
    notes: Optional[str] = None
    application_id: Optional[UUID] = None

class NetworkContact(NetworkContactBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
