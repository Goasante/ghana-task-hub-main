@echo off
echo Building Ghana Task Hub Frontend...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo Build failed! Please check for errors.
    pause
    exit /b 1
)

echo Starting Frontend Server...
python serve-frontend.py

