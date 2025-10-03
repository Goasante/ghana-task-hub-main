@echo off
REM Ghana Task Hub Setup Script for Windows
REM This script sets up both frontend and backend for local development

echo 🇬🇭 Ghana Task Hub Local Setup
echo ===============================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)
echo ✅ Python found

REM Setup backend
echo ℹ️  Setting up backend...
if not exist "backend" (
    echo ❌ Backend directory not found
    pause
    exit /b 1
)

cd backend

REM Create virtual environment
echo ℹ️  Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

REM Install dependencies
echo ℹ️  Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo ℹ️  Creating environment file...
    copy env.example .env
    echo ⚠️  Please update backend\.env with your configuration
)

cd ..

REM Setup frontend
echo ℹ️  Setting up frontend...

REM Install dependencies
echo ℹ️  Installing Node.js dependencies...
npm install

REM Create .env.local file if it doesn't exist
if not exist ".env.local" (
    echo ℹ️  Creating frontend environment file...
    copy env.local .env.local
    echo ⚠️  Please update .env.local with your configuration
)

echo.
echo ✅ Setup complete! 🎉
echo.
echo ℹ️  To start the application:
echo   Backend:  python start-backend.py
echo   Frontend: node start-frontend.js
echo.
echo ℹ️  Or use Docker:
echo   docker-compose up
echo.
echo ℹ️  URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo ⚠️  Remember to update your environment files with actual configuration!
echo.
pause
