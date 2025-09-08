@echo off
echo Stopping StudioHub Dashboard...
echo.

docker-compose -f docker-compose.easy.yml down

if errorlevel 1 (
    echo ERROR: Failed to stop services
    pause
    exit /b 1
)

echo.
echo StudioHub Dashboard stopped successfully!
echo.
pause
