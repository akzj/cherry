# CherryServer Docker Startup Script for Windows
# This script automatically detects and uses the correct Docker Compose command

param(
    [Parameter(Position=0)]
    [string]$Command = "dev"
)

# Colors for output
$ErrorColor = "Red"
$InfoColor = "Green" 
$WarningColor = "Yellow"

# Function to print colored output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $InfoColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $WarningColor
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $ErrorColor
}

# Detect Docker Compose command
function Get-DockerComposeCommand {
    try {
        # Test new Docker Compose command
        $null = docker compose version 2>$null
        if ($LASTEXITCODE -eq 0) {
            return "docker compose"
        }
    }
    catch {}

    try {
        # Test old docker-compose command
        $null = docker-compose --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            return "docker-compose"
        }
    }
    catch {}

    Write-Error "Neither 'docker compose' nor 'docker-compose' is available"
    Write-Error "Please install Docker Desktop for Windows"
    exit 1
}

# Check if Docker is installed
try {
    $null = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw
    }
}
catch {
    Write-Error "Docker is not installed or not in PATH"
    Write-Info "Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Main execution
Write-Info "Detecting Docker Compose version..."

$DockerComposeCmd = Get-DockerComposeCommand
Write-Info "Using: $DockerComposeCmd"

switch ($Command.ToLower()) {
    { $_ -in @("dev", "development") } {
        Write-Info "Starting development environment..."
        
        # Split the command for proper execution
        $cmdParts = $DockerComposeCmd -split ' '
        if ($cmdParts.Length -eq 2) {
            & $cmdParts[0] $cmdParts[1] up -d
        } else {
            & $cmdParts[0] up -d
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Development environment started!"
            Write-Host ""
            Write-Host "🚀 Services are now running:" -ForegroundColor Cyan
            Write-Host "   📡 CherryServer API: http://localhost:3000" -ForegroundColor White
            Write-Host "   🗄️  pgAdmin: http://localhost:8080" -ForegroundColor White
            Write-Host "   🔑 pgAdmin login: admin@cherryserver.com / admin123" -ForegroundColor White
            Write-Host ""
            Write-Host "🧪 Test login credentials:" -ForegroundColor Cyan
            Write-Host "   Username: admin" -ForegroundColor White
            Write-Host "   Password: password123" -ForegroundColor White
        } else {
            Write-Error "Failed to start development environment"
            exit 1
        }
    }
    
    { $_ -in @("prod", "production") } {
        if (-not (Test-Path ".env")) {
            Write-Error ".env file not found!"
            Write-Info "Please copy env.example to .env and configure it:"
            Write-Info "  Copy-Item env.example .env"
            Write-Info "  # Edit .env file with your production settings"
            exit 1
        }
        
        Write-Info "Starting production environment..."
        
        $cmdParts = $DockerComposeCmd -split ' '
        if ($cmdParts.Length -eq 2) {
            & $cmdParts[0] $cmdParts[1] -f docker-compose.yml -f docker-compose.prod.yml up -d
        } else {
            & $cmdParts[0] -f docker-compose.yml -f docker-compose.prod.yml up -d
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Production environment started!"
            Write-Host ""
            Write-Host "🚀 Production services are running on port 3000" -ForegroundColor Cyan
        } else {
            Write-Error "Failed to start production environment"
            exit 1
        }
    }
    
    "stop" {
        Write-Info "Stopping all services..."
        
        $cmdParts = $DockerComposeCmd -split ' '
        if ($cmdParts.Length -eq 2) {
            & $cmdParts[0] $cmdParts[1] down
            & $cmdParts[0] $cmdParts[1] -f docker-compose.yml -f docker-compose.prod.yml down 2>$null
        } else {
            & $cmdParts[0] down
            & $cmdParts[0] -f docker-compose.yml -f docker-compose.prod.yml down 2>$null
        }
        
        Write-Info "All services stopped!"
    }
    
    "logs" {
        Write-Info "Showing CherryServer logs..."
        
        $cmdParts = $DockerComposeCmd -split ' '
        if ($cmdParts.Length -eq 2) {
            & $cmdParts[0] $cmdParts[1] logs -f cherryserver
        } else {
            & $cmdParts[0] logs -f cherryserver
        }
    }
    
    "status" {
        Write-Info "Service status:"
        
        $cmdParts = $DockerComposeCmd -split ' '
        if ($cmdParts.Length -eq 2) {
            & $cmdParts[0] $cmdParts[1] ps
        } else {
            & $cmdParts[0] ps
        }
    }
    
    "clean" {
        Write-Info "Cleaning up all containers and volumes..."
        
        $cmdParts = $DockerComposeCmd -split ' '
        if ($cmdParts.Length -eq 2) {
            & $cmdParts[0] $cmdParts[1] down -v --remove-orphans
            & $cmdParts[0] $cmdParts[1] -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans 2>$null
        } else {
            & $cmdParts[0] down -v --remove-orphans
            & $cmdParts[0] -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans 2>$null
        }
        
        docker system prune -f
        Write-Info "Cleanup complete!"
    }
    
    { $_ -in @("help", "--help", "-h") } {
        Write-Host "CherryServer Docker Management Script for Windows" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: .\docker-start.ps1 [command]" -ForegroundColor White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Yellow
        Write-Host "  dev, development  Start development environment (default)" -ForegroundColor White
        Write-Host "  prod, production  Start production environment" -ForegroundColor White
        Write-Host "  stop             Stop all services" -ForegroundColor White
        Write-Host "  logs             Show application logs" -ForegroundColor White
        Write-Host "  status           Show service status" -ForegroundColor White
        Write-Host "  clean            Remove all containers and volumes" -ForegroundColor White
        Write-Host "  help             Show this help message" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\docker-start.ps1            # Start development environment" -ForegroundColor White
        Write-Host "  .\docker-start.ps1 dev        # Start development environment" -ForegroundColor White
        Write-Host "  .\docker-start.ps1 prod       # Start production environment" -ForegroundColor White
        Write-Host "  .\docker-start.ps1 stop       # Stop all services" -ForegroundColor White
    }
    
    default {
        Write-Error "Unknown command: $Command"
        Write-Info "Use '.\docker-start.ps1 help' to see available commands"
        exit 1
    }
} 