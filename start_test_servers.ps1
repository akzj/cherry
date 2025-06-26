# 启动测试服务器的 PowerShell 脚本

Write-Host "启动测试服务器..." -ForegroundColor Green

# 创建测试数据目录
if (!(Test-Path "crates/streamserver/test_data")) {
    New-Item -ItemType Directory -Path "crates/streamserver/test_data" -Force
}

# 启动 streamserver
Write-Host "启动 StreamServer..." -ForegroundColor Yellow
Start-Process -FilePath "cargo" -ArgumentList "run", "--manifest-path", "crates/streamserver/Cargo.toml", "--", "-c", "crates/streamserver/config.dev.yaml" -WindowStyle Normal

# 等待 streamserver 启动
Start-Sleep -Seconds 2

# 启动 cherryserver
Write-Host "启动 CherryServer..." -ForegroundColor Yellow
Start-Process -FilePath "cargo" -ArgumentList "run", "--manifest-path", "crates/cherryserver/Cargo.toml", "--", "-c", "crates/cherryserver/config.dev.yaml" -WindowStyle Normal

Write-Host "服务器启动完成！" -ForegroundColor Green
Write-Host "StreamServer: http://localhost:8080" -ForegroundColor Cyan
Write-Host "CherryServer: http://localhost:8181" -ForegroundColor Cyan 