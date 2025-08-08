#!/bin/bash
# FlowForge simple deployment script
set -e

# Build backend
cd $(dirname $0)/..
cd backend
npm install
npm run build || echo "No build script defined"

# Build frontend
cd ../frontend
npm install
npm run build

# Restart Docker containers
cd ..
docker-compose -f docker-compose.dev.yml up -d --build

echo "Deployment complete!"
