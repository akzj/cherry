# PowerShell script to start CherryServer with environment variables
# This demonstrates how to override configuration using environment variables

# Set environment variables
$env:CHERRYSERVER_SERVER__HOST = "127.0.0.1"
$env:CHERRYSERVER_SERVER__PORT = "8080"
$env:CHERRYSERVER_DATABASE__URL = "postgresql://user:pass@localhost:5432/cherryserver"
$env:CHERRYSERVER_DATABASE__MAX_CONNECTIONS = "20"
$env:CHERRYSERVER_JWT__SECRET = "env-override-secret"
$env:CHERRYSERVER_JWT__EXPIRATION_HOURS = "72"
$env:CHERRYSERVER_LOGGING__LEVEL = "debug"

Write-Host "Starting CherryServer with environment variable overrides..."
Write-Host "Server will run on $env:CHERRYSERVER_SERVER__HOST`:$env:CHERRYSERVER_SERVER__PORT"
Write-Host "Database URL: $env:CHERRYSERVER_DATABASE__URL"
Write-Host "JWT expiration: $env:CHERRYSERVER_JWT__EXPIRATION_HOURS hours"

# Start the server
cd crates/cherryserver
cargo run 