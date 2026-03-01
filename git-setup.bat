@echo off
REM Yuvraj Tech Admin Panel - Git Setup Script (Windows)
REM This script initializes the git repository and pushes to GitHub

echo.
echo ========================================
echo Yuvraj Tech Admin Panel - Git Setup
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/6] Initializing Git repository...
git init
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo [2/6] Adding all files to Git...
git add .
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo [3/6] Creating initial commit...
git commit -m "Initial commit: Yuvraj Tech Admin Panel - Mobile-first admin panel for license management - Dark minimal UI theme - Firebase integration for real-time data - PWA support with offline functionality - TypeScript + Next.js 13 App Router - Bottom navigation for mobile UX - Secure authentication system"
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo [4/6] Renaming branch to main...
git branch -M main
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo [5/6] Adding remote origin...
git remote add origin https://github.com/Rishabhpkashyap/TraderNidhi.git
if %ERRORLEVEL% NEQ 0 (
    echo Remote already exists, updating...
    git remote set-url origin https://github.com/Rishabhpkashyap/TraderNidhi.git
)

echo.
echo [6/6] Pushing to GitHub...
git push -u origin main
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo ========================================
echo SUCCESS! Repository setup complete!
echo ========================================
echo.
echo Your code is now available at:
echo https://github.com/Rishabhpkashyap/TraderNidhi
echo.
echo Next steps:
echo 1. Go to https://github.com/Rishabhpkashyap/TraderNidhi
echo 2. Add a description and topics to your repository
echo 3. Set up GitHub Pages if needed
echo 4. Configure branch protection rules
echo 5. Add collaborators if needed
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo ERROR: Git operation failed!
echo ========================================
echo.
echo Please check the error message above and try again.
echo.
echo Common issues:
echo - Make sure you have internet connection
echo - Verify GitHub repository exists
echo - Check if you have push access to the repository
echo - Ensure you're logged in to GitHub
echo.
pause
exit /b 1
