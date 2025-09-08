# Docker Setup for StudioHub Dashboard

This guide explains how to run the StudioHub Dashboard using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Clone the repository** (if not already done)
   ```bash
   git clone <your-repo-url>
   cd StudioHub-Dashboard
   ```

2. **Environment setup**
   ```bash
   # Copy the example environment file
   cp .env.docker.example .env.local
   
   # Edit .env.local with your FileMaker credentials
   ```

3. **Build and run with Docker Compose**
   ```bash
   # Build and start all services
   docker-compose up --build
   
   # Or run in detached mode
   docker-compose up -d --build
   ```

4. **Access the application**
   - Main app: http://localhost:3000
   - Login with your FileMaker credentials

## Docker Commands

### Start services
```bash
docker-compose up
```

### Stop services
```bash
docker-compose down
```

### Rebuild after changes
```bash
docker-compose up --build
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mcp-server
```

### Access container shell
```bash
# Next.js app
docker exec -it studiohub-app sh

# MCP server
docker exec -it studiohub-mcp sh
```

## Development Workflow

1. **Hot Reload**: The development setup includes volume mounts for hot reloading. Changes to your code will automatically reflect in the running containers.

2. **Database Access**: The MCP server handles all FileMaker API communications. The main app communicates with FileMaker through the MCP server.

3. **Environment Variables**: 
   - Development: Edit `.env.local`
   - Production: Set environment variables in your deployment platform

## Troubleshooting

### Port conflicts
If port 3000 is already in use:
```bash
# Change the port in docker-compose.yml
ports:
  - "3001:3000"  # Maps container's 3000 to host's 3001
```

### Permission issues
If you encounter permission errors:
```bash
# Fix ownership
sudo chown -R $(whoami):$(whoami) .
```

### Build cache issues
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Network issues
```bash
# Restart Docker network
docker-compose down
docker network prune
docker-compose up
```

## Production Deployment

For production, use the main Dockerfile:
```bash
# Build production image
docker build -t studiohub-dashboard .

# Run production container
docker run -p 3000:3000 --env-file .env.production studiohub-dashboard
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser       │────▶│   Next.js App   │────▶│   MCP Server    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               Docker                      │
                              Network                      │
                                                          ▼
                                                  ┌─────────────────┐
                                                  │ FileMaker Server│
                                                  └─────────────────┘
```

## File Structure

```
StudioHub-Dashboard/
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── docker-compose.yml      # Orchestration
├── .dockerignore          # Files to exclude
├── .env.local             # Environment variables
├── app/                   # Next.js app directory
├── components/            # React components
├── lib/                   # Utilities
└── mcp-server/           # FileMaker MCP server
    └── Dockerfile        # MCP server image
```