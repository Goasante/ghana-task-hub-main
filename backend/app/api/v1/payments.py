"""
Payments API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import HTTPBearer, verify_token

router = APIRouter()
security = HTTPBearer()

async def get_current_user(credentials = Depends(security)):
    """Get current user from token"""
    payload = verify_token(credentials.credentials)
    return {"user_id": payload.get("sub"), "role": payload.get("role")}

@router.get("/transactions")
async def get_transactions(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user transactions"""
    try:
        result = await db.execute(
            "SELECT * FROM transactions WHERE \"userId\" = :user_id ORDER BY \"createdAt\" DESC",
            {"user_id": current_user["user_id"]}
        )
        transactions = result.fetchall()
        
        transaction_list = []
        for tx in transactions:
            transaction_list.append({
                "id": str(tx.id),
                "amount": tx.amount,
                "currency": tx.currency,
                "type": tx.type,
                "status": tx.status,
                "description": tx.description,
                "createdAt": tx.createdAt.isoformat()
            })
        
        return {
            "success": True,
            "data": transaction_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transactions: {str(e)}"
        )

@router.post("/process")
async def process_payment(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Process payment (mock implementation)"""
    return {
        "success": True,
        "message": "Payment processed successfully",
        "data": {"transactionId": "mock_transaction_id"}
    }
