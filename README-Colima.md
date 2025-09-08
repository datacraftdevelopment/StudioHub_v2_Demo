# StudioHub Dashboard - Colima Deployment

This document explains how to run the StudioHub Dashboard using Colima on macOS.

## Prerequisites

1. **Colima** - Docker runtime for macOS
   ```bash
   brew install colima
   ```

2. **Docker CLI** (if not already installed)
   ```bash
   brew install docker
   ```

## Quick Start

1. **Start Colima** (if not already running):
   ```bash
   colima start
   ```

2. **Run the StudioHub Dashboard**:
   ```bash
   ./start-colima.sh
   ```

3. **Access the application**:
   - Open your browser to: http://localhost:3001
   - The dashboard will be available on port 3001 (to avoid conflicts with Baserow on port 3000)

4. **Stop the application**:
   ```bash
   ./stop-colima.sh
   ```

## Manual Docker Commands

If you prefer to run Docker commands manually:

### Build and Run
```bash
# Build the image
docker compose -f docker-compose.colima.yml build

# Start the container
docker compose -f docker-compose.colima.yml up -d

# Check status
docker ps

# View logs
docker logs studiohub-app
```

### Stop and Clean Up
```bash
# Stop the container
docker compose -f docker-compose.colima.yml down

# Remove the image (optional)
docker rmi studiohub-dashboard-app
```

## Configuration

The application is configured with the following environment variables (in `docker-compose.colima.yml`):

- **NEXT_PUBLIC_APP_URL**: http://localhost:3001
- **STUDIOHUB_HOST**: saurfmpro03.imp.corp.transcontinental.ca
- **STUDIOHUB_DATABASE**: StudioHub
- **STUDIOHUB_USERNAME**: api
- **STUDIOHUB_PASSWORD**: API!23
- **STUDIOHUB_SSL_VERIFY**: false

## Port Configuration

- **Application**: http://localhost:3001
- **Container Internal Port**: 3000
- **Mapped to Host Port**: 3001

This avoids conflicts with other services (like Baserow) running on port 3000.

## Troubleshooting

### Check Container Status
```bash
docker ps
```

### View Application Logs
```bash
docker logs studiohub-app
```

### Check Colima Status
```bash
colima status
```

### Restart Colima
```bash
colima stop
colima start
```

### Container Won't Start
If you get a "container name already in use" error:
```bash
docker rm -f studiohub-app
./start-colima.sh
```

## File Structure

- `docker-compose.colima.yml` - Docker Compose configuration for Colima
- `Dockerfile.colima` - Optimized Dockerfile for Colima deployment
- `start-colima.sh` - Script to start the application
- `stop-colima.sh` - Script to stop the application

## Notes

- The application uses production mode (`NODE_ENV=production`)
- SSL verification is disabled for FileMaker connection
- The build includes TypeScript compilation and optimization
- Development dependencies are removed after build to reduce image size
