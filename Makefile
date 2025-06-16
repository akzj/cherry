# CherryServer Docker Management
.PHONY: help build up down logs clean test prod-up prod-down dev-up dev-down

# Default target
help:
	@echo "CherryServer Docker Management Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev-up      - Start development environment (with pgAdmin)"
	@echo "  make dev-down    - Stop development environment"
	@echo "  make logs        - Show application logs"
	@echo "  make test        - Run configuration tests"
	@echo ""
	@echo "Production:"
	@echo "  make prod-up     - Start production environment"
	@echo "  make prod-down   - Stop production environment"
	@echo ""
	@echo "General:"
	@echo "  make build       - Build the application image"
	@echo "  make up          - Start basic environment"
	@echo "  make down        - Stop all services"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make shell       - Connect to application container shell"
	@echo ""

# Build the application image
build:
	docker compose build cherryserver

# Development environment (includes pgAdmin)
dev-up:
	docker compose up -d
	@echo "Development environment started!"
	@echo "CherryServer: http://localhost:3000"
	@echo "pgAdmin: http://localhost:8080 (admin@cherryserver.com / admin123)"
	@echo ""
	@echo "Test login: admin / password123"

dev-down:
	docker compose down

# Production environment
prod-up:
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Copy env.example to .env and configure it."; \
		exit 1; \
	fi
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "Production environment started!"

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Basic environment
up:
	docker compose up -d --profile=admin  # Start without pgAdmin

down:
	docker compose down

# Show logs
logs:
	docker compose logs -f cherryserver

logs-all:
	docker compose logs -f

# Run tests
test:
	docker compose exec cherryserver /app/test_config || echo "Container not running, building and testing..."
	docker compose run --rm cherryserver ./test_config

# Connect to application shell
shell:
	docker compose exec cherryserver /bin/bash

# Database shell
db-shell:
	docker compose exec postgres psql -U postgres -d cherryserver

# Clean up everything
clean:
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans
	docker system prune -f

# Reset database
db-reset:
	docker compose down postgres
	docker volume rm streamstore-rs_postgres_data || true
	docker compose up -d postgres
	@echo "Database reset complete!"

# Check status
status:
	docker compose ps

# View database data
db-info:
	docker compose exec postgres psql -U postgres -d cherryserver -c "\dt"
	docker compose exec postgres psql -U postgres -d cherryserver -c "SELECT COUNT(*) as users FROM users;"
	docker compose exec postgres psql -U postgres -d cherryserver -c "SELECT COUNT(*) as groups FROM groups;" 