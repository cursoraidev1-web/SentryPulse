.PHONY: help build start stop restart logs clean migrate seed

help:
	@echo "SentryPulse - Make Commands (Node.js Backend)"
	@echo ""
	@echo "  make build       - Build Docker images"
	@echo "  make start       - Start all services"
	@echo "  make stop        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - Show logs"
	@echo "  make migrate     - Run database migrations"
	@echo "  make seed        - Seed database with test data"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make backend     - Access backend shell"

build:
	@echo "Building Docker images..."
	@docker compose build

start:
	@echo "Starting services..."
	@docker compose up -d
	@echo "Waiting for MySQL to be ready..."
	@sleep 10
	@echo "Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000/api"

stop:
	@echo "Stopping services..."
	@docker compose down

restart:
	@echo "Restarting services..."
	@docker compose restart

logs:
	@docker compose logs -f

migrate:
	@echo "Running migrations..."
	@docker compose exec backend npm run migrate

seed:
	@echo "Seeding database..."
	@docker compose exec backend npm run seed

clean:
	@echo "Cleaning up..."
	@docker compose down -v
	@echo "All containers and volumes removed!"

backend:
	@docker compose exec backend sh
