"""
Payment model and related schemas
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, JSON, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from app.core.database import Base

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"

class PaymentType(str, enum.Enum):
    TASK_PAYMENT = "TASK_PAYMENT"
    PLATFORM_FEE = "PLATFORM_FEE"
    PAYOUT = "PAYOUT"
    REFUND = "REFUND"

class PaymentProvider(str, enum.Enum):
    PAYSTACK = "PAYSTACK"
    FLUTTERWAVE = "FLUTTERWAVE"
    MTN_MOMO = "MTN_MOMO"
    VODAFONE_CASH = "VODAFONE_CASH"
    AIRTELTIGO_MONEY = "AIRTELTIGO_MONEY"
    GHC_BANK = "GHC_BANK"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    taskId = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    
    # Payment details
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="GHS")
    type = Column(Enum(PaymentType), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Provider details
    provider = Column(Enum(PaymentProvider), nullable=False)
    providerTransactionId = Column(String(255), nullable=True)
    providerReference = Column(String(255), nullable=True)
    
    # Additional data
    description = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="payments")
    task = relationship("Task", back_populates="payments")

class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Method details
    type = Column(String(50), nullable=False)  # CARD, MOBILE_MONEY, BANK_TRANSFER
    provider = Column(Enum(PaymentProvider), nullable=False)
    details = Column(JSON, nullable=False)  # Encrypted payment details
    
    # Status
    isActive = Column(Boolean, default=True)
    isDefault = Column(Boolean, default=False)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

class Payout(Base):
    __tablename__ = "payouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    taskerId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Payout details
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="GHS")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Method details
    methodType = Column(String(50), nullable=False)  # MOBILE_MONEY, BANK_ACCOUNT
    provider = Column(Enum(PaymentProvider), nullable=False)
    details = Column(JSON, nullable=False)
    
    # Additional data
    description = Column(Text, nullable=True)
    
    # Timestamps
    requestedAt = Column(DateTime(timezone=True), server_default=func.now())
    processedAt = Column(DateTime(timezone=True), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
