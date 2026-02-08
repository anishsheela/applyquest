from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base_class import Base

class PointHistory(Base):
    """Track all point changes for audit trail"""
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    points = Column(Integer, nullable=False)  # Can be positive or negative
    reason = Column(String, nullable=False)  # e.g., "Created application", "Updated contact"
    reference_type = Column(String, nullable=True)  # e.g., "application", "network_contact"
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # ID of the related entity
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="point_history")
