@echo off
echo 🎨 FlowForge Frontend Startup
echo.

cd /d "%~dp0\..\frontend"

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
    echo Installing frontend packages...
    npm install
)

echo.
echo 🟢 Starting FlowForge Frontend Server...
echo 🎨 UI will be available at: http://localhost:3000
echo.

npm run dev

pause
