@echo off
echo 🚀 FlowForge Backend Startup
echo.

cd /d "%~dp0\..\backend"

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

echo Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing backend packages...
    npm install
)

echo.
echo 🟢 Starting FlowForge Backend Server...
echo 📡 Server will be available at: http://localhost:3001
echo.

npm run dev

pause
