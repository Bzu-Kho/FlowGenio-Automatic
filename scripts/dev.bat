@echo off
REM 🚀 FlowForge Development Startup Script for Windows
REM Starts both backend and frontend servers

echo 🔥 Starting FlowForge Development Environment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Start backend server
echo 🚀 Starting Backend Server...
cd backend
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)

echo 🟢 Starting backend on http://localhost:3001
start "FlowForge Backend" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo.
echo 🎨 Starting Frontend Server...
cd ..\frontend
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

echo 🟢 Starting frontend on http://localhost:3000
start "FlowForge Frontend" cmd /k "npm run dev"

REM Wait for servers to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 FlowForge is now running!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo 📡 WebSocket: ws://localhost:3001/ws
echo 💡 Health Check: http://localhost:3001/health
echo.
echo Both servers are running in separate windows.
echo Close the terminal windows to stop the servers.
echo.
pause
