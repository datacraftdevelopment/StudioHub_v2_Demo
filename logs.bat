@echo off
echo Showing StudioHub Dashboard logs...
echo Press Ctrl+C to exit log viewing
echo.

docker-compose -f docker-compose.easy.yml logs -f
