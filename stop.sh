#!/bin/bash

echo "Stopping StudioHub Dashboard..."
echo

# Load port configuration if it exists
if [ -f .env.deploy ]; then
    source .env.deploy
    export HOST_PORT
fi

if docker compose -f docker-compose.easy.yml down; then
    echo
    echo "StudioHub Dashboard stopped successfully!"
    # Clean up the deploy environment file
    rm -f .env.deploy
else
    echo "ERROR: Failed to stop services"
    exit 1
fi
