@echo off
echo ============================================
echo  Git Commit & Push to GitHub
echo ============================================
echo.

REM Check if Git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/download/win
    echo.
    echo After installing Git, restart this script.
    pause
    exit /b 1
)

echo [1/7] Configuring Git user...
for /f "tokens=* delims=" %%a in ('git config --get user.name 2^>nul') do set GIT_USER_NAME=%%a
for /f "tokens=* delims=" %%a in ('git config --get user.email 2^>nul') do set GIT_USER_EMAIL=%%a

if "%GIT_USER_NAME%"=="" (
    echo   Setting git user.name to Alerasajeruk
    call git config user.name "Alerasajeruk"
) else (
    echo   ✓ git user.name already set to %GIT_USER_NAME%
)

if "%GIT_USER_EMAIL%"=="" (
    echo   Setting git user.email to solution.iki@gmail.com
    call git config user.email "solution.iki@gmail.com"
) else (
    echo   ✓ git user.email already set to %GIT_USER_EMAIL%
)

echo.
echo [2/7] Checking Git status...
git status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Initializing Git repository...
    call git init
    if errorlevel 1 (
        echo ERROR: Failed to initialize Git repository
        pause
        exit /b 1
    )
    echo   ✓ Git repository initialized
) else (
    echo   ✓ Git repository already exists
)

echo.
echo [3/7] Checking remote repository...
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Adding remote repository...
    call git remote add origin https://github.com/Alerasajeruk/balikudriver.git
    if errorlevel 1 (
        echo WARNING: Failed to add remote (might already exist)
        call git remote set-url origin https://github.com/Alerasajeruk/balikudriver.git
    )
    echo   ✓ Remote repository added
) else (
    echo   ✓ Remote repository already configured
    call git remote set-url origin https://github.com/Alerasajeruk/balikudriver.git
)

echo.
echo [4/7] Adding all files to Git...
call git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo   ✓ Files added to staging

echo.
echo [5/7] Checking for changes...
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo   ⚠ No changes to commit
    echo   Checking if already committed...
    git log -1 --oneline >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo   ✓ Already committed
        goto :push
    ) else (
        echo   Creating initial commit...
        call git commit -m "Initial commit: Baliku Driver & Guide PWA with Admin Portal"
        if errorlevel 1 (
            echo ERROR: Failed to create commit
            pause
            exit /b 1
        )
        echo   ✓ Initial commit created
        goto :push
    )
)

echo.
echo [6/7] Creating commit...
echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update: Build process, Vercel deployment setup, and optimizations
)

call git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)
echo   ✓ Commit created

:push
echo.
echo [7/7] Pushing to GitHub...
echo.
echo WARNING: This will push to https://github.com/Alerasajeruk/balikudriver.git
echo.
set /p CONFIRM="Continue with push? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Push cancelled.
    pause
    exit /b 0
)

call git branch -M main
call git push -u origin main
if errorlevel 1 (
    echo.
    echo ERROR: Push failed
    echo.
    echo Possible reasons:
    echo  1. Repository is not empty (try: git pull --allow-unrelated-histories first)
    echo  2. Authentication required (GitHub credentials)
    echo  3. Network issue
    echo.
    echo You may need to:
    echo  - Pull first: git pull origin main --allow-unrelated-histories
    echo  - Or force push (if empty repo): git push -u origin main --force
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  ✅ Successfully pushed to GitHub!
echo ============================================
echo.
echo Repository: https://github.com/Alerasajeruk/balikudriver.git
echo.
pause

