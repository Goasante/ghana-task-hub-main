"""
Admin model and related schemas
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, JSON, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    resourceId = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ipAddress = Column(String(45), nullable=True)
    userAgent = Column(Text, nullable=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column(UUID(as_uuid=True), nullable=False)
    
    # Ticket details
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    priority = Column(String(20), default="MEDIUM")
    status = Column(String(20), default="OPEN")
    
    # Assignment
    assignedTo = Column(UUID(as_uuid=True), nullable=True)
    
    # Additional data
    attachments = Column(JSON, nullable=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    resolvedAt = Column(DateTime(timezone=True), nullable=True)
