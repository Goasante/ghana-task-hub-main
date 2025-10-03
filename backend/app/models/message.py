"""
Message model and related schemas
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from app.core.database import Base

class MessageType(str, enum.Enum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    FILE = "FILE"
    LOCATION = "LOCATION"
    SYSTEM = "SYSTEM"

class NotificationType(str, enum.Enum):
    TASK_ASSIGNED = "TASK_ASSIGNED"
    TASK_COMPLETED = "TASK_COMPLETED"
    PAYMENT_RECEIVED = "PAYMENT_RECEIVED"
    MESSAGE_RECEIVED = "MESSAGE_RECEIVED"
    SYSTEM_UPDATE = "SYSTEM_UPDATE"

class NotificationPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    taskId = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    senderId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    receiverId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Message content
    type = Column(Enum(MessageType), default=MessageType.TEXT)
    content = Column(Text, nullable=False)
    metadata = Column(JSON, nullable=True)  # For images, files, location data
    
    # Status
    isRead = Column(Boolean, default=False)
    isDeleted = Column(Boolean, default=False)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    readAt = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    task = relationship("Task", back_populates="messages")
    sender = relationship("User", foreign_keys=[senderId], back_populates="messages_sent")
    receiver = relationship("User", foreign_keys=[receiverId], back_populates="messages_received")

class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    taskId = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False)
    clientId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    taskerId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Status
    isActive = Column(Boolean, default=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    task = relationship("Task")
    client = relationship("User", foreign_keys=[clientId])
    tasker = relationship("User", foreign_keys=[taskerId])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    taskId = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    
    # Notification content
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    
    # Status
    isRead = Column(Boolean, default=False)
    isDeleted = Column(Boolean, default=False)
    
    # Additional data
    data = Column(JSON, nullable=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    readAt = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User")
    task = relationship("Task")
