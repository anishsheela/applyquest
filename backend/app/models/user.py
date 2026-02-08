from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.db.base_class import Base

class User(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    current_education = Column(String, nullable=True)
    german_level = Column(String, nullable=True)
    current_role = Column(String, nullable=True)
    # points removed - will be calculated from point_history
    level = Column(Integer, default=1)
    level_name = Column(String, default='Novice')
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("Application", back_populates="user")
    network_contacts = relationship("NetworkContact", back_populates="user")
    point_history = relationship("PointHistory", back_populates="user", cascade="all, delete-orphan")
    
    @property
    def points(self) -> int:
        """Calculate total points from point history"""
        return sum(ph.points for ph in self.point_history)
