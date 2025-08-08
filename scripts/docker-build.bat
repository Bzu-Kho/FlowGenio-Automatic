@echo off
echo 🐳 Building FlowForge Docker Images...

:: Build production images
docker-compose build

echo ✅ Docker images built successfully!
echo.
echo To start FlowForge:
echo   Production: docker-compose up -d
echo   Development: docker-compose -f docker-compose.dev.yml up -d
pause
