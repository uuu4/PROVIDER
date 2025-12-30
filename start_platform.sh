#!/bin/bash

# Zero-Touch Platform Installer
# usage: ./start_platform.sh

echo "🚀 Starting Distributed SaaS Platform Setup..."

# 0. Create Shared Network
echo "🌐 Creating shared Docker network 'saas-network'..."
# Check if exists first
if [ -z "$(docker network ls --filter name=^saas-network$ --format="{{ .Name }}")" ]; then
    docker network create saas-network
    echo "✅ Network created."
else
    echo "ℹ️ Network already exists."
fi

# 1. Start SaaS Provider (We are in this directory normally, or script is here)
echo "\n🏗️ Building and Starting SaaS Provider..."
# Assuming script is run from inside saas-provider
docker-compose down
docker-compose up -d --build
echo "✅ SaaS Provider started (Admin: http://localhost:4201)"

# 2. Wait a bit for Provider DB to be ready
echo "⏳ Waiting 10s for Provider to initialize..."
sleep 10

# 3. Start Tenant App
echo "\n🏗️ Building and Starting Tenant App..."
# Go to TENANT dir relative to saas-provider
cd ../TENANT
docker-compose down
docker-compose up -d --build
echo "✅ Tenant App started (Store: http://localhost:4200)"

echo "\n🎉 Setup Complete!"
echo "------------------------------------------------"
echo "👉 Provider Admin: http://localhost:4201"
echo "👉 Tenant Store:   http://localhost:4200"
echo "👉 Provider API:   http://localhost:8001"
echo "👉 Tenant API:     http://localhost:8000"
echo "------------------------------------------------"
echo "Data has been seeded automatically."
echo "Admin Login: admin@provider.com / password123"
echo "Tenant Login: admin@test.com / password123"
