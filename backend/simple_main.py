"""
Simple FastAPI backend for testing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Ghana Task Hub API",
    description="Backend API for Ghana Task Hub",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Ghana Task Hub API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Ghana Task Hub API is running"
    }

@app.get("/api/v1/test")
async def test_endpoint():
    """Test endpoint"""
    return {
        "success": True,
        "message": "API is working",
        "data": {
            "timestamp": "2024-01-01T00:00:00Z",
            "environment": "development"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting Ghana Task Hub Backend...")
    print("📍 Backend will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("=" * 50)
    
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
