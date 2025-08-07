#!/bin/bash

# 🚀 FlowForge Development Startup Script
# Starts both backend and frontend servers

echo "🔥 Starting FlowForge Development Environment..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Start backend server
echo "🚀 Starting Backend Server..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🟢 Starting backend on http://localhost:3001"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo ""
echo "🎨 Starting Frontend Server..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🟢 Starting frontend on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

# Wait for servers to start
sleep 5

echo ""
echo "🎉 FlowForge is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📡 WebSocket: ws://localhost:3001/ws"
echo "💡 Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "echo ''; echo '🛑 Stopping FlowForge...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT
wait
