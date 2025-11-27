@echo off
REM ============================================
REM Baliku Driver - Frontend PWA Startup
REM ============================================

echo.
echo ========================================
echo  Baliku Driver - Frontend PWA
echo ========================================
echo.

REM Navigate to client directory
cd /d "%~dp0apps\baliku-driver-client"

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Frontend PWA Server...
echo.
echo Frontend will run on: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the client server
call npm start

pause

