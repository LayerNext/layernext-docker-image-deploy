#!/bin/bash
set -e

# -----------------------------------------------------------------------------
# Auto-switch to 'ubuntu' user if running as root
# -----------------------------------------------------------------------------
if [ "$(whoami)" != "ubuntu" ]; then
  echo "Detected execution as root. Switching to 'ubuntu' user..."
  sudo -u ubuntu bash -c "bash '$0' --as-ubuntu"
  echo "Switched execution to ubuntu user. Exiting root process..."
  exit 0
fi

if [ "$1" == "--as-ubuntu" ]; then
  shift
fi

echo -e "\nConfirmed running as user: $(whoami)"
echo "Working directory: $(pwd)"

# -----------------------------------------------------------------------------
# Prepare workspace
# -----------------------------------------------------------------------------
echo -e "\nPreparing workspace..."
if [ ! -d "/home/ubuntu/layernext" ]; then
  echo "Creating /home/ubuntu/layernext directory..."
  mkdir -p /home/ubuntu/layernext
else
  echo "Directory /home/ubuntu/layernext already exists."
fi
cd /home/ubuntu/layernext
echo "Current path: $(pwd)"

# -----------------------------------------------------------------------------
# Update existing repository
# -----------------------------------------------------------------------------
echo -e "\nSyncing LayerNext repository..."
cd /home/ubuntu/layernext

if [ ! -d "layernext-docker-image-deploy/.git" ]; then
  echo "Repository not found. Cloning fresh copy..."
  git clone https://github.com/LayerNext/layernext-docker-image-deploy.git
else
  echo "Repository already exists. Pulling latest changes..."
fi

cd /home/ubuntu/layernext/layernext-docker-image-deploy
echo "Current repo path: $(pwd)"

echo -e "\nChecking out 'layernext-tenant' branch..."
git fetch origin
git checkout layernext-tenant || git checkout -b layernext-tenant origin/layernext-tenant
git pull origin layernext-tenant
echo "Branch synced: $(git branch --show-current)"

# -----------------------------------------------------------------------------
# Pull Docker images
# -----------------------------------------------------------------------------
echo -e "\nPulling Docker images for updated services..."
SERVICES=("accounts" "chat" "datalake" "monitoring")

for service in "${SERVICES[@]}"; do
  if [ -d "$service" ]; then
    echo -e "\nProcessing service: $service"
    cd "$service"
    echo "Current service path: $(pwd)"
    docker compose pull || echo "Warning: Failed to pull images for $service"
    cd ..
  else
    echo "Skipping $service — directory not found."
  fi
done
echo "Docker image pulls completed."

# -----------------------------------------------------------------------------
# Final message
# -----------------------------------------------------------------------------
echo "LayerNext setup completed successfully"

