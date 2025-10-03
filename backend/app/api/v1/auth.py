"""
Authentication API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from pydantic import BaseModel, validator
import re

from app.core.database import get_db
from app.core.security import (
    create_access_token, 
    create_refresh_token, 
    verify_token,
    generate_otp,
    format_phone_number
)
from app.models.user import User, UserRole, UserStatus
from app.core.config import settings

router = APIRouter()
security = HTTPBearer()

# Request/Response models
class PhoneAuthRequest(BaseModel):
    phone: str
    
    @validator('phone')
    def validate_phone(cls, v):
        # Basic phone validation
        phone = format_phone_number(v)
        if not re.match(r'^\+233\d{9}$', phone):
            raise ValueError('Invalid Ghana phone number format')
        return phone

class OTPVerificationRequest(BaseModel):
    phone: str
    otp: str

class RegistrationRequest(BaseModel):
    phone: str
    otp: str
    firstName: str
    lastName: str
    email: str = None
    role: UserRole

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class AuthResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any] = None
    error: str = None

# Mock OTP storage (in production, use Redis)
otp_storage: Dict[str, str] = {}

@router.post("/request-otp", response_model=AuthResponse)
async def request_otp(request: PhoneAuthRequest, db: AsyncSession = Depends(get_db)):
    """Request OTP for phone verification"""
    try:
        # Generate OTP
        otp = generate_otp()
        otp_storage[request.phone] = otp
        
        # In production, send SMS via Twilio
        print(f"OTP for {request.phone}: {otp}")  # Remove in production
        
        # Check if user exists
        result = await db.execute(
            "SELECT * FROM users WHERE phone = :phone",
            {"phone": request.phone}
        )
        user_exists = result.fetchone() is not None
        
        return AuthResponse(
            success=True,
            message="OTP sent successfully",
            data={
                "phone": request.phone,
                "userExists": user_exists,
                "expiresIn": settings.OTP_EXPIRE_MINUTES * 60
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(request: OTPVerificationRequest, db: AsyncSession = Depends(get_db)):
    """Verify OTP code"""
    try:
        # Check OTP
        stored_otp = otp_storage.get(request.phone)
        if not stored_otp or stored_otp != request.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        # Remove OTP after successful verification
        del otp_storage[request.phone]
        
        return AuthResponse(
            success=True,
            message="OTP verified successfully",
            data={"phone": request.phone}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP verification failed: {str(e)}"
        )

@router.post("/register", response_model=AuthResponse)
async def register(request: RegistrationRequest, db: AsyncSession = Depends(get_db)):
    """Register new user"""
    try:
        # Verify OTP again
        stored_otp = otp_storage.get(request.phone)
        if not stored_otp or stored_otp != request.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        # Check if user already exists
        result = await db.execute(
            "SELECT * FROM users WHERE phone = :phone",
            {"phone": request.phone}
        )
        if result.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )
        
        # Create user
        user_data = {
            "phone": request.phone,
            "firstName": request.firstName,
            "lastName": request.lastName,
            "email": request.email,
            "role": request.role.value,
            "status": UserStatus.PENDING.value,
            "isPhoneVerified": True
        }
        
        # Insert user (in production, use proper ORM)
        await db.execute(
            """
            INSERT INTO users (phone, firstName, lastName, email, role, status, "isPhoneVerified")
            VALUES (:phone, :firstName, :lastName, :email, :role, :status, :isPhoneVerified)
            """,
            user_data
        )
        await db.commit()
        
        # Remove OTP
        del otp_storage[request.phone]
        
        # Generate tokens
        token_data = {"sub": request.phone, "role": request.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return AuthResponse(
            success=True,
            message="Registration successful",
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "user": {
                    "phone": request.phone,
                    "firstName": request.firstName,
                    "lastName": request.lastName,
                    "email": request.email,
                    "role": request.role.value
                }
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Refresh access token"""
    try:
        payload = verify_token(credentials.credentials)
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Generate new access token
        token_data = {"sub": payload["sub"], "role": payload["role"]}
        access_token = create_access_token(token_data)
        
        return AuthResponse(
            success=True,
            message="Token refreshed successfully",
            data={
                "access_token": access_token,
                "token_type": "bearer"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )

@router.get("/me", response_model=AuthResponse)
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Get current user information"""
    try:
        payload = verify_token(credentials.credentials)
        phone = payload.get("sub")
        
        if not phone:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        
        # Get user from database
        result = await db.execute(
            "SELECT * FROM users WHERE phone = :phone",
            {"phone": phone}
        )
        user = result.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return AuthResponse(
            success=True,
            message="User information retrieved successfully",
            data={
                "id": str(user.id),
                "phone": user.phone,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "role": user.role,
                "status": user.status
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )
