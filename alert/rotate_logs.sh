#!/bin/bash

# Get the directory of the script
SCRIPT_DIR=$(dirname "$0")

LOG_FILE="$SCRIPT_DIR/monitor/docker-stats.log"
ARCHIVE_FOLDER="$SCRIPT_DIR/monitor/archive"

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_FOLDER"

# Get the current date in YYYY-MM-DD format
CURRENT_DATE=$(date +%Y-%m-%d)

# Rotate log file
if [ -f "$LOG_FILE" ]; then
    mv "$LOG_FILE" "${ARCHIVE_FOLDER}/docker-stats-${CURRENT_DATE}.log"
fi

# Remove logs older than 7 days
find "$ARCHIVE_FOLDER" -name "docker-stats-*.log" -mtime +7 -exec rm {} \;
