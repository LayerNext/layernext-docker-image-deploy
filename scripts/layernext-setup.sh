#!/bin/bash
set -e

echo -e "\n==== LayerNext Base Image Setup (Ubuntu 24) ====\n"

# -----------------------------------------------------------------------------
# 1️⃣ Prepare workspace
# -----------------------------------------------------------------------------
cd /home/ubuntu
mkdir -p /home/ubuntu/layernext
cd /home/ubuntu/layernext

# -----------------------------------------------------------------------------
# 2️⃣ Update and upgrade system packages
# -----------------------------------------------------------------------------
echo -e "\nUpdating system packages..."
sudo apt update -y && sudo apt upgrade -y

# -----------------------------------------------------------------------------
# 3️⃣ Install base dependencies and utilities
# -----------------------------------------------------------------------------
echo -e "\nInstalling required packages..."
sudo apt install -y \
    python3 python3-pip python3-venv \
    curl jq \
    ca-certificates gnupg lsb-release apt-transport-https software-properties-common

# -----------------------------------------------------------------------------
# 4️⃣ Install Certbot with Route53 DNS plugin (for SSL automation)
# -----------------------------------------------------------------------------
echo -e "\nInstalling Certbot and AWS Route53 plugin..."
sudo apt install -y certbot python3-certbot-dns-route53

# -----------------------------------------------------------------------------
# 5️⃣ Install and configure Nginx
# -----------------------------------------------------------------------------
echo -e "\nInstalling and configuring Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo ufw allow 'Nginx Full'

# -----------------------------------------------------------------------------
# 6️⃣ Install and configure Docker
# -----------------------------------------------------------------------------
echo -e "\nInstalling Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
sudo chmod 666 /var/run/docker.sock

# -----------------------------------------------------------------------------
# 7️⃣ Install Docker Compose (latest version)
# -----------------------------------------------------------------------------
echo -e "\nInstalling Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# -----------------------------------------------------------------------------
# 8️⃣ Install Socat (for networking utilities)
# -----------------------------------------------------------------------------
echo -e "\nInstalling Socat..."
sudo apt install -y socat

# -----------------------------------------------------------------------------
# 9️⃣ Clone LayerNext Docker Deployment Repository
# -----------------------------------------------------------------------------
echo -e "\nCloning LayerNext Docker deployment repository..."
cd /home/ubuntu/layernext
if [ ! -d "layernext-docker-image-deploy" ]; then
    git clone https://github.com/LayerNext/layernext-docker-image-deploy.git
else
    echo "Repository already exists. Skipping clone."
fi

# -----------------------------------------------------------------------------
# 🔟 Checkout to 'layernext-tenant' branch
# -----------------------------------------------------------------------------
echo -e "\nChecking out to 'layernext-tenant' branch..."
cd /home/ubuntu/layernext/layernext-docker-image-deploy
git fetch origin
git checkout layernext-tenant || git checkout -b layernext-tenant origin/layernext-tenant

# -----------------------------------------------------------------------------
# 1️⃣1️⃣ Pull required Docker images for all services
# -----------------------------------------------------------------------------
echo -e "\nPulling Docker images for services..."

# Define the list of service folders
SERVICES=("accounts" "chat" "datalake")

for service in "${SERVICES[@]}"; do
    if [ -d "$service" ]; then
        echo -e "\nPulling images for $service ..."
        cd "$service"
        docker compose pull
        cd ..
    fi
done

# -----------------------------------------------------------------------------
# 1️⃣2️⃣ Create required Docker networks
# -----------------------------------------------------------------------------
echo -e "\nCreating Docker networks..."
docker network create layernext_network || true
docker network create kind || true

# -----------------------------------------------------------------------------
# ✅ Final message
# -----------------------------------------------------------------------------
echo -e "\n==== LayerNext Base Image Setup Completed Successfully ====\n"
