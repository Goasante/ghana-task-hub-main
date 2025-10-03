"""
Admin API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import HTTPBearer, verify_token

router = APIRouter()
security = HTTPBearer()

async def get_admin_user(credentials = Depends(security)):
    """Get current admin user from token"""
    payload = verify_token(credentials.credentials)
    if payload.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return {"user_id": payload.get("sub"), "role": payload.get("role")}

@router.get("/dashboard")
async def get_admin_dashboard(
    current_user: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard data"""
    try:
        # Get basic stats
        stats = {
            "totalUsers": 0,
            "totalTasks": 0,
            "totalRevenue": 0,
            "activeTaskers": 0
        }
        
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard data: {str(e)}"
        )

@router.get("/users")
async def get_all_users(
    current_user: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all users (admin only)"""
    try:
        result = await db.execute("SELECT * FROM users ORDER BY \"createdAt\" DESC")
        users = result.fetchall()
        
        user_list = []
        for user in users:
            user_list.append({
                "id": str(user.id),
                "phone": user.phone,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "createdAt": user.createdAt.isoformat()
            })
        
        return {
            "success": True,
            "data": user_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )
