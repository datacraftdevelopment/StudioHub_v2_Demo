#!/bin/bash

# StudioHub Dashboard - Colima Stop Script
set -e

echo "🛑 Stopping StudioHub Dashboard..."

# Stop and remove containers
docker compose -f docker-compose.colima.yml down

echo "✅ StudioHub Dashboard stopped successfully"
