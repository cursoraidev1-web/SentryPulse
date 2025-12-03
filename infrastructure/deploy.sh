#!/bin/bash

set -e

echo "Deploying SentryPulse (Node.js backend)..."

echo "Building Docker images..."
docker compose build

echo "Starting services..."
docker compose up -d

echo "Waiting for MySQL to be ready..."
until docker compose exec -T mysql mysqladmin ping -h localhost --silent; do
    echo "Waiting for MySQL..."
    sleep 2
done

echo "Running database migrations..."
docker compose exec -T backend npm run migrate

echo "Deployment complete!"

echo ""
echo "Services running:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000/api"
echo "  - Tracker: http://localhost/tracker.js"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To run database seeder:"
echo "  docker compose exec backend npm run seed"
