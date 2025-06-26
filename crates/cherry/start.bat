@echo off
echo === Cherry 调试模式启动 ===
echo.

echo 检查Node.js...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 检查npm...
npm --version
if %errorlevel% neq 0 (
    echo 错误: 未找到npm
    pause
    exit /b 1
)

echo 安装依赖...
npm install

echo.
echo 启动Tauri开发服务器...
echo 按 Ctrl+C 停止服务器
echo.
echo 调试提示:
echo 1. 按 F12 打开开发者工具
echo 2. 点击右上角的 'Show Debug' 按钮显示调试面板
echo 3. 在控制台中执行 window.debugTools.runAllChecks() 进行全面检查
echo 4. 查看 DEBUG_GUIDE.md 获取详细调试指南
echo.

npm run tauri dev 