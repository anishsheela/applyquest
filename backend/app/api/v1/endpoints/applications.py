from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import application as application_model
from app.models import user as user_model
from app.schemas import application as application_schema
from app.models.application import ApplicationStatus

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper to get current user (assuming single user)
def get_current_user(db: Session):
    user = db.query(user_model.User).first()
    if not user:
         # Auto-create if missing for development ease
        user = user_model.User(name="Default User", email="user@example.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/", response_model=List[application_schema.Application])
def read_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve applications.
    """
    user = get_current_user(db)
    applications = db.query(application_model.Application).filter(application_model.Application.user_id == user.id).offset(skip).limit(limit).all()
    return applications

@router.post("/", response_model=application_schema.Application)
def create_application(
    *,
    db: Session = Depends(get_db),
    application_in: application_schema.ApplicationCreate,
) -> Any:
    """
    Create new application.
    """
    user = get_current_user(db)
    application = application_model.Application(
        **application_in.dict(),
        user_id=user.id
    )
    db.add(application)
    
    # Award 2 points for creating an application
    user.points += 2
    db.add(user)
    
    db.commit()
    db.refresh(application)
    
    # Record initial history
    history = application_model.ApplicationHistory(
        application_id=application.id,
        new_status=application.status,
        notes="Initial application creation"
    )
    db.add(history)
    db.commit()
    
    return application

@router.get("/{id}", response_model=application_schema.Application)
def read_application(
    *,
    db: Session = Depends(get_db),
    id: str,
) -> Any:
    """
    Get application by ID.
    """
    application = db.query(application_model.Application).filter(application_model.Application.id == id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.put("/{id}", response_model=application_schema.Application)
def update_application(
    *,
    db: Session = Depends(get_db),
    id: str,
    application_in: application_schema.ApplicationUpdate,
) -> Any:
    """
    Update an application.
    """
    application = db.query(application_model.Application).filter(application_model.Application.id == id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    user = get_current_user(db)
    
    update_data = application_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    db.add(application)
    
    # Award 1 point for updating an application
    user.points += 1
    db.add(user)
    
    db.commit()
    db.refresh(application)
    return application

@router.patch("/{id}/status", response_model=application_schema.Application)
def update_application_status(
    *,
    db: Session = Depends(get_db),
    id: str,
    new_status: ApplicationStatus = Body(embed=True),
    notes: str = Body(default=None, embed=True),
) -> Any:
    """
    Update application status with strict transition rules.
    """
    application = db.query(application_model.Application).filter(application_model.Application.id == id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    current_status = application.status
    
    # Define allowed transitions
    # Map current_status -> allowed_next_statuses
    valid_transitions = {
        ApplicationStatus.APPLIED: [ApplicationStatus.REPLIED, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
        ApplicationStatus.REPLIED: [ApplicationStatus.PHONE_SCREEN, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
        ApplicationStatus.PHONE_SCREEN: [ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
        ApplicationStatus.TECHNICAL_ROUND_1: [ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
        ApplicationStatus.TECHNICAL_ROUND_2: [ApplicationStatus.FINAL_ROUND, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
        ApplicationStatus.FINAL_ROUND: [ApplicationStatus.OFFER, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
        ApplicationStatus.OFFER: [ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED], # Can reject an offer too
        ApplicationStatus.REJECTED: [], # Terminal state
        ApplicationStatus.GHOSTED: [],  # Terminal state
    }
    
    # Always allow moving to Rejected or Ghosted from any non-terminal state
    # (Already covered in map above, but good logic to keep in mind)
    
    if new_status not in valid_transitions.get(current_status, []):
         raise HTTPException(
            status_code=400, 
            detail=f"Invalid status transition from {current_status} to {new_status}"
        )

    # Perform update
    application.status = new_status
    db.add(application)
    
    # Record history
    history = application_model.ApplicationHistory(
        application_id=application.id,
        old_status=current_status,
        new_status=new_status,
        notes=notes
    )
    db.add(history)
    
    db.commit()
    db.refresh(application)
    return application

@router.delete("/{id}", response_model=application_schema.Application)
def delete_application(
    *,
    db: Session = Depends(get_db),
    id: str,
) -> Any:
    """
    Delete an application.
    """
    application = db.query(application_model.Application).filter(application_model.Application.id == id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(application)
    db.commit()
    return application
