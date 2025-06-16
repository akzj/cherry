#!/bin/bash

# CherryServer Docker Startup Script
# This script automatically detects and uses the correct Docker Compose command

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect Docker Compose command
detect_docker_compose() {
    if command -v "docker" >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        echo "docker compose"
    elif command -v "docker-compose" >/dev/null 2>&1; then
        echo "docker-compose"
    else
        print_error "Neither 'docker compose' nor 'docker-compose' is available"
        print_error "Please install Docker and Docker Compose"
        exit 1
    fi
}

# Main function
main() {
    print_info "Detecting Docker Compose version..."
    
    DOCKER_COMPOSE_CMD=$(detect_docker_compose)
    print_info "Using: $DOCKER_COMPOSE_CMD"
    
    case "${1:-dev}" in
        "dev" | "development")
            print_info "Starting development environment..."
            $DOCKER_COMPOSE_CMD up -d
            print_info "Development environment started!"
            echo ""
            echo "🚀 Services are now running:"
            echo "   📡 CherryServer API: http://localhost:3000"
            echo "   🗄️  pgAdmin: http://localhost:8080"
            echo "   🔑 pgAdmin login: admin@cherryserver.com / admin123"
            echo ""
            echo "🧪 Test login credentials:"
            echo "   Username: admin"
            echo "   Password: password123"
            ;;
            
        "prod" | "production")
            if [ ! -f .env ]; then
                print_error ".env file not found!"
                print_info "Please copy env.example to .env and configure it:"
                print_info "  cp env.example .env"
                print_info "  # Edit .env file with your production settings"
                exit 1
            fi
            
            print_info "Starting production environment..."
            $DOCKER_COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml up -d
            print_info "Production environment started!"
            echo ""
            echo "🚀 Production services are running on port 3000"
            ;;
            
        "stop")
            print_info "Stopping all services..."
            $DOCKER_COMPOSE_CMD down
            $DOCKER_COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true
            print_info "All services stopped!"
            ;;
            
        "logs")
            print_info "Showing CherryServer logs..."
            $DOCKER_COMPOSE_CMD logs -f cherryserver
            ;;
            
        "status")
            print_info "Service status:"
            $DOCKER_COMPOSE_CMD ps
            ;;
            
        "clean")
            print_info "Cleaning up all containers and volumes..."
            $DOCKER_COMPOSE_CMD down -v --remove-orphans
            $DOCKER_COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
            docker system prune -f
            print_info "Cleanup complete!"
            ;;
            
        "help" | "--help" | "-h")
            echo "CherryServer Docker Management Script"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  dev, development  Start development environment (default)"
            echo "  prod, production  Start production environment"
            echo "  stop             Stop all services"
            echo "  logs             Show application logs"
            echo "  status           Show service status"
            echo "  clean            Remove all containers and volumes"
            echo "  help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                # Start development environment"
            echo "  $0 dev            # Start development environment"
            echo "  $0 prod           # Start production environment"
            echo "  $0 stop           # Stop all services"
            ;;
            
        *)
            print_error "Unknown command: $1"
            print_info "Use '$0 help' to see available commands"
            exit 1
            ;;
    esac
}

# Check if Docker is installed
if ! command -v "docker" >/dev/null 2>&1; then
    print_error "Docker is not installed or not in PATH"
    print_info "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Run main function
main "$@" 