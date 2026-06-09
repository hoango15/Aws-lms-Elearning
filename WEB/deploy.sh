#!/bin/bash

# --- Automated Deployment Script for AWS EC2 (Ubuntu 22.04) ---
# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "🚀 Starting Deployment of E-Learn LMS Website"
echo "============================================="

# 1. Update Ubuntu Packages
echo "🔄 Updating system package repositories..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Prerequisites
echo "🛠️ Installing prerequisite tools (curl, git, apt-transport-https)..."
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git

# 3. Install Docker Engine
if ! [ -x "$(command -v docker)" ]; then
    echo "🐳 Docker not found. Installing Docker Engine..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Configure user group permission (so we don't always need sudo for docker)
    sudo usermod -aG docker $USER
    echo "🐳 Docker Engine installed successfully."
else
    echo "🐳 Docker Engine is already installed."
fi

# 4. Install Docker Compose (standalone binary if not covered by package)
if ! [ -x "$(command -v docker-compose)" ]; then
    echo "🐳 Installing Docker Compose standalone CLI..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose || true
    echo "🐳 Docker Compose installed successfully."
else
    echo "🐳 Docker Compose is already installed."
fi

# 5. Build and Deploy Container Stack
echo "🏗️ Checking docker-compose.yml configuration..."
if [ -f "docker-compose.yml" ]; then
    echo "🧱 Building and rebuilding container layers..."
    sudo docker compose build --no-cache

    echo "⚙️ Starting container clusters in detached mode..."
    sudo docker compose up -d

    echo "📊 Listing running services..."
    sudo docker compose ps
else
    echo "❌ ERROR: docker-compose.yml not found in current directory!"
    echo "Please navigate to the root directory where docker-compose.yml exists before running this script."
    exit 1
fi

echo "==================================================="
echo "✅ Deployment Process Complete!"
echo "Your app is now serving via Nginx Proxy on Port 80."
echo "Check container status by running: docker compose ps"
echo "Check system log feeds by running: docker compose logs -f"
echo "==================================================="
