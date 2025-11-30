#!/bin/bash

set -e

echo "Building SentryPulse..."

echo "Copying environment files..."
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

echo "Generating application key..."
APP_KEY=$(openssl rand -base64 32)
sed -i "s|APP_KEY=|APP_KEY=${APP_KEY}|g" backend/.env

echo "Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 64)
sed -i "s|JWT_SECRET=|JWT_SECRET=${JWT_SECRET}|g" backend/.env

echo "Building Docker images..."
docker compose build --no-cache

echo "Build complete!"
echo ""
echo "Next steps:"
echo "  1. Update backend/.env with your configuration"
echo "  2. Update frontend/.env.local with your configuration"
echo "  3. Run: ./infrastructure/deploy.sh"
