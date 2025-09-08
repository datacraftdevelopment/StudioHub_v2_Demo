@echo off
echo Starting StudioHub Dashboard deployment...
echo.

echo Checking if Docker is running...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop and make sure it's running
    pause
    exit /b 1
)

echo Docker found! Starting deployment...
echo.

docker-compose -f docker-compose.easy.yml up -d

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    echo Check the error messages above
    pause
    exit /b 1
)

echo.
echo ========================================
echo  StudioHub Dashboard deployed successfully!
echo ========================================
echo.
echo Dashboard URL: http://localhost:3000
echo MCP Server:    http://localhost:3001
echo.
echo To stop: run "stop.bat"
echo To view logs: run "logs.bat"
echo.
pause
