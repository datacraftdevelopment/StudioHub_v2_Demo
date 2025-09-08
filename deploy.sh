#!/bin/bash

echo "Starting StudioHub Dashboard deployment..."
echo

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    echo "Please install Docker and Docker Compose first"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "ERROR: Docker is not running"
    echo "Please start Docker first"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Find available port starting from 3000
find_available_port() {
    local port=3000
    while check_port $port; do
        echo "Port $port is already in use, trying next port..."
        ((port++))
        if [ $port -gt 3010 ]; then
            echo "ERROR: Could not find available port between 3000-3010"
            echo "Please free up some ports or manually specify a port"
            exit 1
        fi
    done
    echo $port
}

# Check for port configuration file
if [ -f port-config.txt ] && [ -z "$HOST_PORT" ]; then
    # Extract HOST_PORT from config file if it exists and is uncommented
    CONFIG_PORT=$(grep -v '^#' port-config.txt | grep 'HOST_PORT=' | cut -d'=' -f2 | tr -d ' ')
    if [ ! -z "$CONFIG_PORT" ]; then
        HOST_PORT=$CONFIG_PORT
        echo "Found port configuration: $HOST_PORT"
    fi
fi

# Determine port to use
if [ -z "$HOST_PORT" ]; then
    HOST_PORT=$(find_available_port)
    echo "Auto-detected available port: $HOST_PORT"
else
    if check_port $HOST_PORT; then
        echo "ERROR: Specified port $HOST_PORT is already in use"
        echo "Options:"
        echo "1. Free the port and try again"
        echo "2. Edit port-config.txt to use a different port"
        echo "3. Run with: HOST_PORT=<other_port> ./deploy.sh"
        exit 1
    fi
    echo "Using specified port: $HOST_PORT"
fi

export HOST_PORT

echo "Docker found! Starting deployment..."
echo

# Deploy the services
if docker compose -f docker-compose.easy.yml up -d; then
    echo
    echo "========================================"
    echo " StudioHub Dashboard deployed successfully!"
    echo "========================================"
    echo
    echo "Dashboard URL: http://localhost:$HOST_PORT"
    echo
    echo "To stop: ./stop.sh"
    echo "To view logs: ./logs.sh"
    echo
    # Save the port for other scripts
    echo "HOST_PORT=$HOST_PORT" > .env.deploy
else
    echo
    echo "ERROR: Deployment failed!"
    echo "Check the error messages above"
    echo "If port conflict, try: HOST_PORT=3001 ./deploy.sh"
    exit 1
fi
