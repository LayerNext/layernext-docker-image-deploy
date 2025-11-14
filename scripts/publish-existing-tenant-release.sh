#!/bin/bash
set -euo pipefail

echo "====================================================="
echo "    LayerNext Tenant Release Publisher"
echo "    (publish-existing-tenant-release.sh)"
echo "====================================================="

REPO_ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Repo root directory: $REPO_ROOT_DIR"

# ---------------------------------------
# Services to update
# ---------------------------------------
SERVICES=("accounts" "chat" "datalake")

echo "Services to process: ${SERVICES[*]}"

# ---------------------------------------
# Docker updates
# ---------------------------------------
echo ""
echo "===== Starting Docker Update Process ====="

for service in "${SERVICES[@]}"; do
    SERVICE_PATH="$REPO_ROOT_DIR/$service"

    if [ -d "$SERVICE_PATH" ]; then
        echo ""
        echo "-------------------------------------------"
        echo "Processing service: $service"
        echo "Path: $SERVICE_PATH"
        echo "-------------------------------------------"

        cd "$SERVICE_PATH"

        echo "Pulling images for $service..."
        if sudo docker compose pull; then
            echo "Pull completed successfully."
        else
            echo "WARNING: Failed to pull images for $service"
        fi

        echo "Recreating containers for $service..."
        if sudo docker compose up -d --force-recreate; then
            echo "Service $service updated successfully."
        else
            echo "WARNING: Failed to recreate $service containers"
        fi

        cd "$REPO_ROOT_DIR"
    else
        echo "Skipping '$service' - directory not found."
    fi
done

echo ""
echo "===== Docker Update Process Completed ====="

# ---------------------------------------
# Cleanup
# ---------------------------------------
echo ""
echo "===== Cleaning Docker System ====="
sudo docker system prune -f
echo "Docker cleanup completed."

echo ""
echo "====================================================="
echo "         Tenant Release Publishing Complete"
echo "====================================================="
