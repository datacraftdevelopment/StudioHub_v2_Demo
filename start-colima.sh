#!/bin/bash

# StudioHub Dashboard - Colima Deployment Script
set -e

echo "🚀 Starting StudioHub Dashboard on Colima..."

# Check if Colima is running
if ! colima status &>/dev/null; then
    echo "❌ Colima is not running. Please start it first with: colima start"
    exit 1
fi

echo "✅ Colima is running"

# Build and start the container
echo "🔨 Building and starting container..."
docker compose -f docker-compose.colima.yml up -d --build

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ StudioHub Dashboard is ready!"
        echo "🌐 Access it at: http://localhost:3001"
        echo "📊 Container status:"
        docker ps | grep studiohub-app
        exit 0
    fi
    sleep 2
    echo -n "."
done

echo "❌ Container failed to start properly. Check logs:"
docker logs studiohub-app
exit 1
