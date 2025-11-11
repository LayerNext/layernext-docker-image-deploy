#!/bin/bash
set -e

echo -e "\n==== Starting LayerNext setup script ===="

# ---------------------------------------------------------------------
# Confirm current user
# ---------------------------------------------------------------------
CURRENT_USER=$(whoami)
if [ "$CURRENT_USER" != "ubuntu" ]; then
  echo "Detected execution as root. Re-invoking as ubuntu..."
  sudo -u ubuntu bash "$0" --as-ubuntu
  exit 0
fi

if [ "$1" == "--as-ubuntu" ]; then
  shift
fi

echo "Running as user: $(whoami)"
echo "Working directory before switching: $(pwd)"

# ---------------------------------------------------------------------
# Move to baked repo
# ---------------------------------------------------------------------
cd /opt/layernext/layernext-docker-image-deploy
echo "Current repo path: $(pwd)"

# ---------------------------------------------------------------------
# Pull Docker images
# ---------------------------------------------------------------------
echo -e "\nPulling Docker images for LayerNext services..."
SERVICES=("accounts" "chat" "datalake" "monitoring")

for service in "${SERVICES[@]}"; do
  if [ -d "$service" ]; then
    echo -e "\n🔹 Processing service: $service"
    cd "$service"
    docker compose pull || echo "Warning: Failed to pull images for $service"
    cd ..
  else
    echo "Skipping $service — directory not found."
  fi
done

echo -e "\n All Docker images pulled successfully."
