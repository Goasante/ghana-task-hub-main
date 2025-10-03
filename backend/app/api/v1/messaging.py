"""
Messaging API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.security import HTTPBearer, verify_token

router = APIRouter()
security = HTTPBearer()

async def get_current_user(credentials = Depends(security)):
    """Get current user from token"""
    payload = verify_token(credentials.credentials)
    return {"user_id": payload.get("sub"), "role": payload.get("role")}

@router.get("/messages/{task_id}")
async def get_messages(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messages for a task"""
    try:
        result = await db.execute(
            "SELECT * FROM messages WHERE \"taskId\" = :task_id ORDER BY \"createdAt\" ASC",
            {"task_id": task_id}
        )
        messages = result.fetchall()
        
        message_list = []
        for msg in messages:
            message_list.append({
                "id": str(msg.id),
                "content": msg.content,
                "type": msg.type,
                "senderId": str(msg.senderId),
                "isRead": msg.isRead,
                "createdAt": msg.createdAt.isoformat()
            })
        
        return {
            "success": True,
            "data": message_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}"
        )

@router.get("/notifications")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user notifications"""
    try:
        result = await db.execute(
            "SELECT * FROM notifications WHERE \"userId\" = :user_id ORDER BY \"createdAt\" DESC",
            {"user_id": current_user["user_id"]}
        )
        notifications = result.fetchall()
        
        notification_list = []
        for notif in notifications:
            notification_list.append({
                "id": str(notif.id),
                "type": notif.type,
                "title": notif.title,
                "message": notif.message,
                "priority": notif.priority,
                "isRead": notif.isRead,
                "createdAt": notif.createdAt.isoformat()
            })
        
        return {
            "success": True,
            "data": notification_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get notifications: {str(e)}"
        )
