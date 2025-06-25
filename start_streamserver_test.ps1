# Start StreamServer test script

Write-Host "Starting StreamServer test..." -ForegroundColor Green

# Create test data directory
if (!(Test-Path "crates/streamserver/test_data")) {
    New-Item -ItemType Directory -Path "crates/streamserver/test_data" -Force
}

# Start streamserver
Write-Host "Starting StreamServer..." -ForegroundColor Yellow
Start-Process -FilePath "cargo" -ArgumentList "run", "--manifest-path", "crates/streamserver/Cargo.toml", "--", "-c", "crates/streamserver/config_test.yaml" -WindowStyle Normal

Write-Host "StreamServer started!" -ForegroundColor Green
Write-Host "StreamServer: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Run test: cd test_message_sending; cargo run simple" -ForegroundColor Cyan 