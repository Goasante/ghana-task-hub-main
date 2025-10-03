#!/usr/bin/env python3
"""
Ghana Task Hub Backend Startup Script
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} detected")

def install_dependencies():
    """Install Python dependencies"""
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        sys.exit(1)
    
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", 
            str(backend_dir / "requirements.txt")
        ], check=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        sys.exit(1)

def setup_environment():
    """Setup environment variables"""
    env_file = Path("backend") / ".env"
    env_example = Path("backend") / "env.example"
    
    if not env_file.exists() and env_example.exists():
        print("📝 Creating .env file from template...")
        env_file.write_text(env_example.read_text())
        print("✅ Environment file created")
        print("⚠️  Please update backend/.env with your actual configuration")

def start_backend():
    """Start the backend server"""
    backend_dir = Path("backend")
    os.chdir(backend_dir)
    
    print("🚀 Starting Ghana Task Hub Backend...")
    print("📍 Backend will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔄 Auto-reload enabled for development")
    print("=" * 50)
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", "main:app", 
            "--host", "0.0.0.0", "--port", "8000", "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")

if __name__ == "__main__":
    print("🇬🇭 Ghana Task Hub Backend Setup")
    print("=" * 40)
    
    check_python_version()
    install_dependencies()
    setup_environment()
    
    print("\n🎯 Starting backend server...")
    start_backend()
