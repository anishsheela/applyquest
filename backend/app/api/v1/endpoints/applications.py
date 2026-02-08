from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.api import deps
from app.models import application as application_model
from app.models import user as user_model
from app.schemas import application as application_schema
from app.models.application import ApplicationStatus

router = APIRouter()

@router.get("/", response_model=List[application_schema.Application])
def read_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: user_model.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve applications.
    """
    applications = db.query(application_model.Application).filter(application_model.Application.user_id == current_user.id).offset(skip).limit(limit).all()
    return applications

@router.post("/", response_model=application_schema.Application)
def create_application(
    *,
    db: Session = Depends(deps.get_db),
    application_in: application_schema.ApplicationCreate,
    current_user: user_model.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new application.
    """
    application = application_model.Application(
        **application_in.dict(),
        user_id=current_user.id
    )
    db.add(application)
    db.flush()  # Get the application ID
    
    # Update gamification stats (2 points)
    from app.core import gamification
    gamification.add_points(
        db=db,
        user=current_user,
        points=2,
        reason="Created new application",
        reference_type="application",
        reference_id=application.id
    )
    
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
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: user_model.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get application by ID.
    """
    application = db.query(application_model.Application).filter(
        application_model.Application.id == id,
        application_model.Application.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.put("/{id}", response_model=application_schema.Application)
def update_application(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    application_in: application_schema.ApplicationUpdate,
    current_user: user_model.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update an application.
    """
    application = db.query(application_model.Application).filter(
        application_model.Application.id == id,
        application_model.Application.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    update_data = application_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    db.add(application)
    
    # Update gamification stats (1 point for update)
    from app.core import gamification
    gamification.add_points(
        db=db,
        user=current_user,
        points=1,
        reason="Updated application",
        reference_type="application",
        reference_id=application.id
    )
    
    db.commit()
    db.refresh(application)
    return application

@router.patch("/{id}/status", response_model=application_schema.Application)
def update_application_status(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    new_status: ApplicationStatus = Body(embed=True),
    notes: str = Body(default=None, embed=True),
    current_user: user_model.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update application status with strict transition rules.
    """
    application = db.query(application_model.Application).filter(
        application_model.Application.id == id,
        application_model.Application.user_id == current_user.id
    ).first()
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
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: user_model.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete an application.
    """
    application = db.query(application_model.Application).filter(
        application_model.Application.id == id,
        application_model.Application.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(application)
    db.commit()
    return application
