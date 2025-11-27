@echo off
echo ============================================
echo  Baliku Driver - Setup & Build Process
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing root dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd apps\baliku-driver-server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo.
echo [3/4] Building all clients...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [4/4] Verifying build output...
if exist "apps\baliku-driver-client\dist\scripts\app.js" (
    echo   ✓ Driver client built successfully
) else (
    echo   ✗ Driver client build output not found
)

if exist "apps\baliku-admin-client\dist\scripts\app.js" (
    echo   ✓ Admin client built successfully
) else (
    echo   ✗ Admin client build output not found
)

echo.
echo ============================================
echo  Setup & Build Completed!
echo ============================================
echo.
echo Next steps:
echo  1. Test the build: Check dist/ folders
echo  2. Deploy to Vercel: npm run deploy
echo.
pause

