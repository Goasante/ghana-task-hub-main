"""
Users API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import HTTPBearer, verify_token

router = APIRouter()
security = HTTPBearer()

async def get_current_user(credentials = Depends(security)):
    """Get current user from token"""
    payload = verify_token(credentials.credentials)
    return {"user_id": payload.get("sub"), "role": payload.get("role")}

@router.get("/profile")
async def get_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile"""
    try:
        result = await db.execute(
            "SELECT * FROM users WHERE phone = :phone",
            {"phone": current_user["user_id"]}
        )
        user = result.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "data": {
                "id": str(user.id),
                "phone": user.phone,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "role": user.role,
                "status": user.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )
