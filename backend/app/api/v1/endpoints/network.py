from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import network as network_model
from app.models import user as user_model
from app.schemas import network as network_schema

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(db: Session):
    user = db.query(user_model.User).first()
    if not user:
        user = user_model.User(name="Default User", email="user@example.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/", response_model=List[network_schema.NetworkContact])
def read_network_contacts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve network contacts.
    """
    user = get_current_user(db)
    contacts = db.query(network_model.NetworkContact).filter(network_model.NetworkContact.user_id == user.id).offset(skip).limit(limit).all()
    return contacts

@router.post("/", response_model=network_schema.NetworkContact)
def create_network_contact(
    *,
    db: Session = Depends(get_db),
    contact_in: network_schema.NetworkContactCreate,
) -> Any:
    """
    Create new network contact.
    """
    user = get_current_user(db)
    contact = network_model.NetworkContact(
        **contact_in.dict(),
        user_id=user.id
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.put("/{id}", response_model=network_schema.NetworkContact)
def update_network_contact(
    *,
    db: Session = Depends(get_db),
    id: str,
    contact_in: network_schema.NetworkContactUpdate,
) -> Any:
    """
    Update a network contact.
    """
    contact = db.query(network_model.NetworkContact).filter(network_model.NetworkContact.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Network contact not found")
    
    update_data = contact_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)
    
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/{id}", response_model=network_schema.NetworkContact)
def delete_network_contact(
    *,
    db: Session = Depends(get_db),
    id: str,
) -> Any:
    """
    Delete a network contact.
    """
    contact = db.query(network_model.NetworkContact).filter(network_model.NetworkContact.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Network contact not found")
    
    db.delete(contact)
    db.commit()
    return contact
