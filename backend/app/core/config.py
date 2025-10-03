"""
Configuration settings for Ghana Task Hub Backend
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Ghana Task Hub"
    VERSION: str = "1.0.0"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://ghana_user:ghana_pass@localhost:5432/ghana_task_hub"
    DATABASE_TEST_URL: str = "postgresql://ghana_user:ghana_pass@localhost:5432/ghana_task_hub_test"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # OTP Settings
    OTP_EXPIRE_MINUTES: int = 5
    OTP_LENGTH: int = 6
    
    # Payment Settings
    PAYSTACK_PUBLIC_KEY: str = "pk_test_your_paystack_public_key"
    PAYSTACK_SECRET_KEY: str = "sk_test_your_paystack_secret_key"
    FLUTTERWAVE_PUBLIC_KEY: str = "FLWPUBK_TEST_your_flutterwave_public_key"
    FLUTTERWAVE_SECRET_KEY: str = "FLWSECK_TEST_your_flutterwave_secret_key"
    
    # File Storage (MinIO/S3)
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "ghana-task-hub"
    MINIO_SECURE: bool = False
    
    # SMS Settings (Twilio)
    TWILIO_ACCOUNT_SID: str = "your_twilio_account_sid"
    TWILIO_AUTH_TOKEN: str = "your_twilio_auth_token"
    TWILIO_PHONE_NUMBER: str = "+1234567890"
    
    # Email Settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600  # 1 hour
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
