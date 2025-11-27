@echo off
REM ============================================
REM Baliku Driver - Backend Server Startup
REM ============================================

echo.
echo ========================================
echo  Baliku Driver - Backend API Server
echo ========================================
echo.

REM Navigate to server directory
cd /d "%~dp0apps\baliku-driver-server"

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Backend API Server...
echo.
echo Backend will run on: http://localhost:4000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
call npm run dev

pause

