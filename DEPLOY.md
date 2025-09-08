# StudioHub Dashboard - Easy Deployment Instructions

## Prerequisites
- Docker and Docker Compose installed on your server
- Internet connection for initial setup

## Super Simple Deployment (One Command!)

1. **Download/Copy the project files** to your server

2. **Open terminal/command prompt** in the project folder

3. **Run this single command:**
   ```bash
   docker-compose -f docker-compose.easy.yml up -d
   ```

That's it! 🎉

## What happens:
- Docker will automatically build both services
- StudioHub Dashboard will be available at: http://localhost:3000
- MCP Server (FileMaker API) will run at: http://localhost:3001
- Both services will restart automatically if they crash

## To stop the application:
```bash
docker-compose -f docker-compose.easy.yml down
```

## To restart after stopping:
```bash
docker-compose -f docker-compose.easy.yml up -d
```

## To view logs (if something goes wrong):
```bash
docker-compose -f docker-compose.easy.yml logs
```

## Configuration
Everything is pre-configured for your intranet! No environment files needed.

**FileMaker Server:** `saurfmpro03.imp.corp.transcontinental.ca`
**Database:** `StudioHub`
**Username:** `api`

## Troubleshooting
- If port 3000 or 3001 are already in use, the deployment will fail
- Make sure Docker is running before executing commands
- First build might take 5-10 minutes depending on internet speed

## File Structure Used:
- `Dockerfile.easy` - Main app container configuration
- `mcp-server/Dockerfile.easy` - MCP server container configuration  
- `docker-compose.easy.yml` - Service orchestration

---
*All configurations are hard-coded for easy intranet deployment*
