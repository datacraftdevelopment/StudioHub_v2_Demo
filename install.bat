@echo off
echo StudioHub Dashboard - Simple Installation
echo ========================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first:
    echo    Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running

REM Stop and remove existing container if it exists
echo 🔄 Cleaning up any existing installation...
docker stop studiohub >nul 2>&1
docker rm studiohub >nul 2>&1

REM Load the Docker image
echo 📦 Loading StudioHub Dashboard image...
docker load < studiohub-dashboard.tar

if errorlevel 1 (
    echo ❌ Failed to load image
    pause
    exit /b 1
)

echo ✅ Image loaded successfully

REM Run the container
echo 🚀 Starting StudioHub Dashboard...
docker run -d -p 3001:3000 --name studiohub --restart unless-stopped joedatacraft/studiohub-dashboard

if errorlevel 1 (
    echo ❌ Failed to start container
    pause
    exit /b 1
)

echo.
echo 🎉 StudioHub Dashboard is now running!
echo.
echo Access your dashboard at:
echo   📱 http://localhost:3001
echo   🌐 http://YOUR-SERVER-IP:3001 (from other devices)
echo.
echo To stop: docker stop studiohub
echo To start: docker start studiohub
echo To view logs: docker logs studiohub
echo.
pause
