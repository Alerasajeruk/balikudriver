@echo off
REM ============================================
REM Baliku Driver - Complete Startup Script
REM Starts Backend + Frontend together
REM ============================================

echo.
echo ================================================
echo  Baliku Driver - Complete Application Startup
echo ================================================
echo.
echo This script will:
echo  1. Start Backend API Server (Port 4000)
echo  2. Start Driver/Guide Frontend PWA (Port 3001)
echo  3. Start Admin Frontend PWA (Port 3002)
echo  4. Open browser automatically
echo.
echo ================================================
echo.

REM Get the script directory
set "SCRIPT_DIR=%~dp0"

echo [1/7] Installing Backend dependencies...
cd /d "%SCRIPT_DIR%apps\baliku-driver-server"
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/7] Installing Driver/Guide Frontend dependencies...
cd /d "%SCRIPT_DIR%apps\baliku-driver-client"
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install driver/guide frontend dependencies
    pause
    exit /b 1
)

echo.
echo [3/7] Installing Admin Frontend dependencies...
cd /d "%SCRIPT_DIR%apps\baliku-admin-client"
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install admin frontend dependencies
    pause
    exit /b 1
)

echo.
echo [4/7] Starting Backend API Server...
cd /d "%SCRIPT_DIR%apps\baliku-driver-server"
start "Baliku Backend API" cmd /k "echo Baliku Backend API Server && echo Running on http://localhost:4000 && echo. && npm run dev"

REM Wait for backend to start
echo [5/7] Waiting for backend to initialize (5 seconds)...
timeout /t 5 /nobreak > nul

echo.
echo [6/7] Starting Driver/Guide Frontend PWA Server...
cd /d "%SCRIPT_DIR%apps\baliku-driver-client"
start "Baliku Driver/Guide PWA" cmd /k "echo Baliku Driver/Guide PWA && echo Running on http://localhost:3001 && echo. && npm start"

REM Wait a moment
timeout /t 2 /nobreak > nul

echo.
echo [7/7] Starting Admin Frontend PWA Server...
cd /d "%SCRIPT_DIR%apps\baliku-admin-client"
start "Baliku Admin PWA" cmd /k "echo Baliku Admin PWA && echo Running on http://localhost:3002 && echo. && npm start"

REM Wait for frontends to start
echo Waiting for frontends to initialize (5 seconds)...
timeout /t 5 /nobreak > nul

echo.
echo ================================================
echo  SUCCESS! Application is starting...
echo ================================================
echo.
echo  Backend API:        http://localhost:4000
echo  Driver/Guide PWA:   http://localhost:3001
echo  Admin PWA:          http://localhost:3002
echo.
echo  Opening browser in 3 seconds...
echo ================================================
echo.

REM Wait a moment then open browser
timeout /t 3 /nobreak > nul

REM Open browser
start http://localhost:3001

echo.
echo Browser opened! The application should load now.
echo.
echo To STOP the servers:
echo  - Close the "Baliku Backend API" window
echo  - Close the "Baliku Driver/Guide PWA" window
echo  - Close the "Baliku Admin PWA" window
echo.
echo This window will close in 10 seconds...
timeout /t 10 /nobreak > nul

