#!/bin/bash

echo "StudioHub Dashboard - Simple Installation"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first:"
    echo "   Download from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is installed and running"

# Stop and remove existing container if it exists
echo "🔄 Cleaning up any existing installation..."
docker stop studiohub 2>/dev/null
docker rm studiohub 2>/dev/null

# Load the Docker image
echo "📦 Loading StudioHub Dashboard image..."
docker load < studiohub-dashboard.tar

if [ $? -eq 0 ]; then
    echo "✅ Image loaded successfully"
else
    echo "❌ Failed to load image"
    exit 1
fi

# Run the container
echo "🚀 Starting StudioHub Dashboard..."
docker run -d -p 3001:3000 --name studiohub --restart unless-stopped joedatacraft/studiohub-dashboard

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 StudioHub Dashboard is now running!"
    echo ""
    echo "Access your dashboard at:"
    echo "  📱 http://localhost:3001"
    echo "  🌐 http://$(hostname -I | awk '{print $1}'):3001 (from other devices)"
    echo ""
    echo "To stop: docker stop studiohub"
    echo "To start: docker start studiohub"
    echo "To view logs: docker logs studiohub"
else
    echo "❌ Failed to start container"
    exit 1
fi
