#!/bin/bash

# Get the directory of the script
SCRIPT_DIR=$(dirname "$0")

# File path for the Docker stats log
LOG_FILE="$SCRIPT_DIR/monitor/docker-stats.log"

# Function to log Docker stats
log_docker_stats() {
    DATE=$(date '+%Y-%m-%d %H:%M:%S')
    # Ensure the directory exists
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "Docker stats at $DATE" >> "$LOG_FILE"
    docker stats --no-stream >> "$LOG_FILE"
}

# Log Docker stats
log_docker_stats
