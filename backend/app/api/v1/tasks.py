"""
Tasks API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, validator
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import HTTPBearer, verify_token
from app.models.task import TaskStatus, TaskPriority

router = APIRouter()
security = HTTPBearer()

# Request/Response models
class TaskCreateRequest(BaseModel):
    title: str
    description: str
    categoryId: str
    addressId: str
    scheduledAt: datetime
    durationEstMins: int
    priceGHS: float
    priority: TaskPriority = TaskPriority.MEDIUM
    isUrgent: bool = False
    location: Optional[str] = None
    requirements: Optional[dict] = None
    
    @validator('title')
    def validate_title(cls, v):
        if len(v) < 5:
            raise ValueError('Title must be at least 5 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        if len(v) < 20:
            raise ValueError('Description must be at least 20 characters')
        return v
    
    @validator('priceGHS')
    def validate_price(cls, v):
        if v < 10:
            raise ValueError('Minimum price is ₵10')
        return v

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduledAt: Optional[datetime] = None
    durationEstMins: Optional[int] = None
    priceGHS: Optional[float] = None
    priority: Optional[TaskPriority] = None
    isUrgent: Optional[bool] = None
    status: Optional[TaskStatus] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    clientId: str
    taskerId: Optional[str]
    categoryId: str
    addressId: str
    scheduledAt: datetime
    durationEstMins: int
    status: TaskStatus
    priority: TaskPriority
    isUrgent: bool
    priceGHS: float
    platformFeeGHS: float
    currency: str
    location: Optional[str]
    createdAt: datetime
    updatedAt: Optional[datetime]

class TaskSearchRequest(BaseModel):
    query: Optional[str] = None
    categoryId: Optional[str] = None
    status: Optional[TaskStatus] = None
    clientId: Optional[str] = None
    taskerId: Optional[str] = None
    minPrice: Optional[float] = None
    maxPrice: Optional[float] = None
    location: Optional[str] = None
    priority: Optional[TaskPriority] = None
    isUrgent: Optional[bool] = None
    page: int = 1
    limit: int = 20

async def get_current_user(credentials = Depends(security)):
    """Get current user from token"""
    payload = verify_token(credentials.credentials)
    return {"user_id": payload.get("sub"), "role": payload.get("role")}

@router.post("/", response_model=dict)
async def create_task(
    request: TaskCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new task"""
    try:
        # Calculate platform fee (5% of task price)
        platform_fee = request.priceGHS * 0.05
        
        task_data = {
            "id": str(uuid.uuid4()),
            "title": request.title,
            "description": request.description,
            "clientId": current_user["user_id"],
            "categoryId": request.categoryId,
            "addressId": request.addressId,
            "scheduledAt": request.scheduledAt,
            "durationEstMins": request.durationEstMins,
            "status": TaskStatus.CREATED.value,
            "priority": request.priority.value,
            "isUrgent": request.isUrgent,
            "priceGHS": request.priceGHS,
            "platformFeeGHS": platform_fee,
            "currency": "GHS",
            "location": request.location,
            "requirements": request.requirements
        }
        
        # Insert task (mock implementation)
        await db.execute(
            """
            INSERT INTO tasks (id, title, description, "clientId", "categoryId", "addressId", 
                             "scheduledAt", "durationEstMins", status, priority, "isUrgent", 
                             "priceGHS", "platformFeeGHS", currency, location, requirements)
            VALUES (:id, :title, :description, :clientId, :categoryId, :addressId, 
                   :scheduledAt, :durationEstMins, :status, :priority, :isUrgent, 
                   :priceGHS, :platformFeeGHS, :currency, :location, :requirements)
            """,
            task_data
        )
        await db.commit()
        
        return {
            "success": True,
            "message": "Task created successfully",
            "data": {"taskId": task_data["id"]}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@router.get("/", response_model=dict)
async def get_tasks(
    query: Optional[str] = Query(None),
    categoryId: Optional[str] = Query(None),
    status: Optional[TaskStatus] = Query(None),
    clientId: Optional[str] = Query(None),
    taskerId: Optional[str] = Query(None),
    minPrice: Optional[float] = Query(None),
    maxPrice: Optional[float] = Query(None),
    location: Optional[str] = Query(None),
    priority: Optional[TaskPriority] = Query(None),
    isUrgent: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get tasks with filtering and pagination"""
    try:
        # Build query conditions
        conditions = []
        params = {"offset": (page - 1) * limit, "limit": limit}
        
        if query:
            conditions.append("(title ILIKE :query OR description ILIKE :query)")
            params["query"] = f"%{query}%"
        
        if categoryId:
            conditions.append('"categoryId" = :categoryId')
            params["categoryId"] = categoryId
        
        if status:
            conditions.append("status = :status")
            params["status"] = status.value
        
        if clientId:
            conditions.append('"clientId" = :clientId')
            params["clientId"] = clientId
        
        if taskerId:
            conditions.append('"taskerId" = :taskerId')
            params["taskerId"] = taskerId
        
        if minPrice:
            conditions.append('"priceGHS" >= :minPrice')
            params["minPrice"] = minPrice
        
        if maxPrice:
            conditions.append('"priceGHS" <= :maxPrice')
            params["maxPrice"] = maxPrice
        
        if location:
            conditions.append("location ILIKE :location")
            params["location"] = f"%{location}%"
        
        if priority:
            conditions.append("priority = :priority")
            params["priority"] = priority.value
        
        if isUrgent is not None:
            conditions.append('"isUrgent" = :isUrgent')
            params["isUrgent"] = isUrgent
        
        # Build SQL query
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        # Get tasks
        tasks_query = f"""
        SELECT * FROM tasks 
        WHERE {where_clause}
        ORDER BY "createdAt" DESC
        LIMIT :limit OFFSET :offset
        """
        
        result = await db.execute(tasks_query, params)
        tasks = result.fetchall()
        
        # Get total count
        count_query = f"""
        SELECT COUNT(*) FROM tasks 
        WHERE {where_clause}
        """
        count_result = await db.execute(count_query, params)
        total = count_result.scalar()
        
        # Convert to response format
        task_list = []
        for task in tasks:
            task_list.append({
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "clientId": str(task.clientId),
                "taskerId": str(task.taskerId) if task.taskerId else None,
                "categoryId": task.categoryId,
                "addressId": task.addressId,
                "scheduledAt": task.scheduledAt.isoformat(),
                "durationEstMins": task.durationEstMins,
                "status": task.status,
                "priority": task.priority,
                "isUrgent": task.isUrgent,
                "priceGHS": task.priceGHS,
                "platformFeeGHS": task.platformFeeGHS,
                "currency": task.currency,
                "location": task.location,
                "createdAt": task.createdAt.isoformat(),
                "updatedAt": task.updatedAt.isoformat() if task.updatedAt else None
            })
        
        return {
            "success": True,
            "data": task_list,
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tasks: {str(e)}"
        )

@router.get("/{task_id}", response_model=dict)
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific task by ID"""
    try:
        result = await db.execute(
            "SELECT * FROM tasks WHERE id = :task_id",
            {"task_id": task_id}
        )
        task = result.fetchone()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return {
            "success": True,
            "data": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "clientId": str(task.clientId),
                "taskerId": str(task.taskerId) if task.taskerId else None,
                "categoryId": task.categoryId,
                "addressId": task.addressId,
                "scheduledAt": task.scheduledAt.isoformat(),
                "durationEstMins": task.durationEstMins,
                "status": task.status,
                "priority": task.priority,
                "isUrgent": task.isUrgent,
                "priceGHS": task.priceGHS,
                "platformFeeGHS": task.platformFeeGHS,
                "currency": task.currency,
                "location": task.location,
                "createdAt": task.createdAt.isoformat(),
                "updatedAt": task.updatedAt.isoformat() if task.updatedAt else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch task: {str(e)}"
        )

@router.put("/{task_id}", response_model=dict)
async def update_task(
    task_id: str,
    request: TaskUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a task"""
    try:
        # Check if task exists and user has permission
        result = await db.execute(
            "SELECT * FROM tasks WHERE id = :task_id",
            {"task_id": task_id}
        )
        task = result.fetchone()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Check permissions (client can update their own tasks, taskers can update assigned tasks)
        if (current_user["role"] == "CLIENT" and str(task.clientId) != current_user["user_id"]) and \
           (current_user["role"] == "TASKER" and str(task.taskerId) != current_user["user_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        # Build update query
        update_fields = []
        params = {"task_id": task_id}
        
        if request.title:
            update_fields.append("title = :title")
            params["title"] = request.title
        
        if request.description:
            update_fields.append("description = :description")
            params["description"] = request.description
        
        if request.scheduledAt:
            update_fields.append('"scheduledAt" = :scheduledAt')
            params["scheduledAt"] = request.scheduledAt
        
        if request.durationEstMins:
            update_fields.append('"durationEstMins" = :durationEstMins')
            params["durationEstMins"] = request.durationEstMins
        
        if request.priceGHS:
            update_fields.append('"priceGHS" = :priceGHS')
            params["priceGHS"] = request.priceGHS
        
        if request.priority:
            update_fields.append("priority = :priority")
            params["priority"] = request.priority.value
        
        if request.isUrgent is not None:
            update_fields.append('"isUrgent" = :isUrgent')
            params["isUrgent"] = request.isUrgent
        
        if request.status:
            update_fields.append("status = :status")
            params["status"] = request.status.value
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update task
        update_query = f"""
        UPDATE tasks 
        SET {', '.join(update_fields)}, "updatedAt" = NOW()
        WHERE id = :task_id
        """
        
        await db.execute(update_query, params)
        await db.commit()
        
        return {
            "success": True,
            "message": "Task updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@router.delete("/{task_id}", response_model=dict)
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a task (soft delete by updating status)"""
    try:
        # Check if task exists and user has permission
        result = await db.execute(
            "SELECT * FROM tasks WHERE id = :task_id",
            {"task_id": task_id}
        )
        task = result.fetchone()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Only client can delete their own tasks
        if str(task.clientId) != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        # Soft delete by updating status
        await db.execute(
            """
            UPDATE tasks 
            SET status = 'CANCELLED', "updatedAt" = NOW()
            WHERE id = :task_id
            """,
            {"task_id": task_id}
        )
        await db.commit()
        
        return {
            "success": True,
            "message": "Task cancelled successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )
