"""
Ghana Task Hub Backend API
FastAPI application for task management platform
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.api.v1 import auth, tasks, users, payments, messaging, admin
from app.core.config import settings
from app.core.database import init_db
from app.core.security import verify_token

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting Ghana Task Hub Backend...")
    await init_db()
    print("✅ Database initialized")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Ghana Task Hub Backend...")

# Create FastAPI app
app = FastAPI(
    title="Ghana Task Hub API",
    description="Backend API for Ghana Task Hub - Task management platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Ghana Task Hub API is running",
        "version": "1.0.0"
    }

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"user_id": user_id, "payload": payload}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(messaging.router, prefix="/api/v1/messaging", tags=["Messaging"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Ghana Task Hub API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
