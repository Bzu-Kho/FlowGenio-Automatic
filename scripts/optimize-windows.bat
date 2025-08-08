@echo off
echo 🐳 FlowForge Docker Optimizer for Windows
echo.

echo 🔧 Step 1: Stopping current containers...
docker compose -f docker-compose.dev.yml down

echo 🔧 Step 2: Cleaning Docker cache...
docker system prune -f

echo 🔧 Step 3: Building optimized images...
docker compose -f docker-compose.dev.yml build --no-cache

echo 🔧 Step 4: Starting optimized containers...
docker compose -f docker-compose.dev.yml up -d

echo ✅ Optimization complete!
echo.
echo 📍 Access points:
echo   Frontend: http://localhost:3002
echo   Backend:  http://localhost:3001
echo   Health:   http://localhost:3001/health
echo.
echo 💡 Performance tips:
echo   1. Add project folder to antivirus exclusions
echo   2. Use WSL2 backend in Docker Desktop
echo   3. Allocate more memory to Docker Desktop
echo.
pause
