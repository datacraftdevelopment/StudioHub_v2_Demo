#!/bin/bash

echo "Showing StudioHub Dashboard logs..."
echo "Press Ctrl+C to exit log viewing"
echo

# Load port configuration if it exists
if [ -f .env.deploy ]; then
    source .env.deploy
    export HOST_PORT
    echo "Using port: $HOST_PORT"
    echo
fi

docker compose -f docker-compose.easy.yml logs -f
