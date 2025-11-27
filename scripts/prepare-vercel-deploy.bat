@echo off
echo Preparing files for Vercel deployment...

REM Build all clients first
echo Building all clients...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

REM Create public directories
if not exist "public\driver" mkdir "public\driver"
if not exist "public\admin" mkdir "public\admin"

REM Copy driver client from dist
echo Copying driver client from dist...
if exist "apps\baliku-driver-client\dist" (
    xcopy /E /I /Y "apps\baliku-driver-client\dist\*" "public\driver\"
) else (
    echo WARNING: dist folder not found, copying from source...
    xcopy /E /I /Y "apps\baliku-driver-client\*" "public\driver\"
)

REM Copy admin client from dist
echo Copying admin client from dist...
if exist "apps\baliku-admin-client\dist" (
    xcopy /E /I /Y "apps\baliku-admin-client\dist\*" "public\admin\"
) else (
    echo WARNING: dist folder not found, copying from source...
    xcopy /E /I /Y "apps\baliku-admin-client\*" "public\admin\"
)

REM Update API_BASE in driver client
echo Updating API_BASE in driver client...
powershell -Command "(Get-Content 'public\driver\scripts\app.js') -replace \"const API_BASE = \(location\.hostname === 'localhost' \|\| location\.hostname === '127\.0\.0\.1'\) \? 'http://localhost:4000' : '';\", \"const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '/api';\" | Set-Content 'public\driver\scripts\app.js'"

REM Update API_BASE in admin client
echo Updating API_BASE in admin client...
powershell -Command "(Get-Content 'public\admin\scripts\app.js') -replace \"const API_BASE = \(location\.hostname === 'localhost' \|\| location\.hostname === '127\.0\.0\.1'\) \? 'http://localhost:4000' : '';\", \"const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '/api';\" | Set-Content 'public\admin\scripts\app.js'"

echo.
echo Done! Files are ready for Vercel deployment.
echo.
echo Next steps:
echo 1. Setup environment variables in Vercel Dashboard
echo 2. Run: vercel --prod
echo.

