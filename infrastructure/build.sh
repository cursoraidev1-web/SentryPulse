#!/bin/bash

set -e

echo "Building SentryPulse (Node.js backend)..."

echo "Copying environment files..."
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

echo "Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" backend/.env && rm backend/.env.bak

echo "Building Docker images..."
docker compose build --no-cache

echo "Build complete!"
echo ""
echo "Next steps:"
echo "  1. Update backend/.env with your configuration"
echo "  2. Update frontend/.env.local with your configuration"
echo "  3. Run: ./infrastructure/deploy.sh"
