from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.db.base_class import Base

class NetworkContact(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    company = Column(String, nullable=True)
    relationship_type = Column(String, nullable=True) # Renamed from relationship to avoid conflict with sqlalchemy
    connection_strength = Column(Integer, default=1)
    last_contact_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("application.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="network_contacts")
    application = relationship("Application", foreign_keys=[application_id], back_populates="network_contacts")
