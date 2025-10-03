"""
Task model and related schemas
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, JSON, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from app.core.database import Base

class TaskStatus(str, enum.Enum):
    CREATED = "CREATED"
    ASSIGNED = "ASSIGNED"
    EN_ROUTE = "EN_ROUTE"
    ON_SITE = "ON_SITE"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DISPUTED = "DISPUTED"

class TaskPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class TaskCategory(str, enum.Enum):
    CLEANING = "CLEANING"
    MAINTENANCE = "MAINTENANCE"
    DELIVERY = "DELIVERY"
    TRANSPORT = "TRANSPORT"
    CONSULTATION = "CONSULTATION"
    OTHER = "OTHER"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # Relationships
    clientId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    taskerId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    categoryId = Column(String(50), nullable=False)
    addressId = Column(String(100), nullable=False)
    
    # Task details
    scheduledAt = Column(DateTime, nullable=False)
    durationEstMins = Column(Integer, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.CREATED)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    isUrgent = Column(Boolean, default=False)
    
    # Pricing
    priceGHS = Column(Float, nullable=False)
    platformFeeGHS = Column(Float, nullable=False)
    currency = Column(String(3), default="GHS")
    
    # Location
    location = Column(String(255), nullable=True)
    coordinates = Column(JSON, nullable=True)  # {lat, lng}
    
    # Additional data
    requirements = Column(JSON, nullable=True)
    images = Column(JSON, nullable=True)
    completionNotes = Column(Text, nullable=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("User", foreign_keys=[clientId], back_populates="tasks_created")
    tasker = relationship("User", foreign_keys=[taskerId], back_populates="tasks_assigned")
    payments = relationship("Payment", back_populates="task")
    messages = relationship("Message", back_populates="task")
