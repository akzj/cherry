# 调试模式启动脚本
Write-Host "=== Cherry 调试模式启动 ===" -ForegroundColor Green

# 检查Node.js
Write-Host "检查Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查npm
Write-Host "检查npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到npm" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "安装依赖..." -ForegroundColor Yellow
npm install

# 启动开发服务器
Write-Host "启动Tauri开发服务器..." -ForegroundColor Yellow
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "调试提示:" -ForegroundColor Cyan
Write-Host "1. 按 F12 打开开发者工具" -ForegroundColor White
Write-Host "2. 点击右上角的 'Show Debug' 按钮显示调试面板" -ForegroundColor White
Write-Host "3. 在控制台中执行 window.debugTools.runAllChecks() 进行全面检查" -ForegroundColor White
Write-Host "4. 查看 DEBUG_GUIDE.md 获取详细调试指南" -ForegroundColor White
Write-Host "" -ForegroundColor White

# 使用正确的PowerShell语法启动Tauri
npm run tauri dev 