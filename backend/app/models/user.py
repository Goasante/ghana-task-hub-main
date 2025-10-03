"""
User model and related schemas
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    CLIENT = "CLIENT"
    TASKER = "TASKER"
    ADMIN = "ADMIN"

class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    PENDING = "PENDING"
    REJECTED = "REJECTED"

class KycStatus(str, enum.Enum):
    NOT_SUBMITTED = "NOT_SUBMITTED"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING)
    
    # Profile information
    profilePicture = Column(String(500), nullable=True)
    dateOfBirth = Column(DateTime, nullable=True)
    gender = Column(String(10), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Location
    location = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    coordinates = Column(JSON, nullable=True)  # {lat, lng}
    
    # KYC
    kycStatus = Column(Enum(KycStatus), default=KycStatus.NOT_SUBMITTED)
    kycDocuments = Column(JSON, nullable=True)
    idNumber = Column(String(50), nullable=True)
    
    # Verification
    isEmailVerified = Column(Boolean, default=False)
    isPhoneVerified = Column(Boolean, default=False)
    
    # Settings
    preferences = Column(JSON, nullable=True)
    notificationSettings = Column(JSON, nullable=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tasks_created = relationship("Task", foreign_keys="Task.clientId", back_populates="client")
    tasks_assigned = relationship("Task", foreign_keys="Task.taskerId", back_populates="tasker")
    payments = relationship("Payment", back_populates="user")
    messages_sent = relationship("Message", foreign_keys="Message.senderId", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="Message.receiverId", back_populates="receiver")
