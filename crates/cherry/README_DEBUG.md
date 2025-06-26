# Cherry 调试指南

## 快速开始

### 方法1: 使用批处理文件（推荐）
```cmd
start.bat
```

### 方法2: 使用PowerShell脚本
```powershell
.\start_debug.ps1
```

### 方法3: 手动启动
```bash
npm install
npm run tauri dev
```

## 应用程序状态

✅ **应用程序已启动** - 端口1420正在监听

## 调试功能

### 1. 内置调试面板
- 应用程序右上角有"Show Debug"按钮
- 点击显示/隐藏调试面板
- 实时显示认证状态和日志信息

### 2. Chrome开发者工具
- 按 `F12` 或 `Ctrl+Shift+I` 打开
- 查看控制台输出
- 检查网络请求
- 分析性能问题

### 3. 调试脚本
在控制台中执行以下命令：

```javascript
// 全面检查
window.debugTools.runAllChecks()

// 检查认证状态
window.debugTools.checkAuthState()

// 强制重新渲染
window.debugTools.forceRerender()

// 清除认证状态
window.debugTools.clearAuthState()

// 模拟登录
window.debugTools.simulateLogin()

// 检查网络连接
window.debugTools.checkNetwork()

// 监控状态变化
window.debugTools.monitorStateChanges()

// 检查错误
window.debugTools.checkErrors()

// 性能检查
window.debugTools.checkPerformance()
```

### 4. 测试页面
打开 `test_debug.html` 文件进行独立测试：
- 检查认证状态
- 测试网络连接
- 模拟登录操作

## 认证问题修复

### 问题描述
应用启动时自动从localStorage恢复登录状态，导致用户未主动登录就被认为已登录。

### 解决方案
1. **添加token验证**: 在初始化时验证token有效性
2. **强制重新登录**: 暂时禁用自动登录，确保安全性
3. **异步初始化**: 使认证初始化过程异步化

### 测试步骤

#### 1. 清除认证数据
在浏览器控制台执行：
```javascript
localStorage.removeItem('auth-storage');
location.reload();
```

#### 2. 验证修复效果
- ✅ 页面应该显示登录表单
- ✅ 不应该自动跳转到主应用
- ✅ 需要手动输入用户名密码登录

#### 3. 使用测试脚本
```javascript
window.testAuthFix()
```

### 技术细节

#### 修复的文件
1. **`crates/cherry/src/store/auth.ts`**
   - 添加了`validateToken`方法
   - 修改了`initialize`方法为异步
   - 在初始化时验证token有效性

2. **`crates/cherry/src-tauri/src/lib.rs`**
   - 添加了`cmd_validate_token`命令
   - 暂时返回false以确保安全

3. **`crates/cherry/src/App.tsx`**
   - 更新了初始化调用为异步

#### 工作流程
1. 应用启动
2. 检查localStorage中的认证数据
3. 如果有数据，调用后端验证token
4. 如果验证失败，清除数据并显示登录表单
5. 用户需要手动登录

## 登录跳转问题调试

### 步骤1: 启动所有服务器
```cmd
# 启动测试服务器
powershell -ExecutionPolicy Bypass -File ..\start_test_servers.ps1

# 启动Tauri应用程序
start.bat
```

### 步骤2: 验证服务器状态
检查以下端口是否正在监听：
- CherryServer: 端口8180
- StreamServer: 端口8080
- Tauri应用: 端口1420

```cmd
netstat -ano | findstr :8180
netstat -ano | findstr :8080
netstat -ano | findstr :1420
```

### 步骤3: 测试服务器连接
在控制台中执行：
```javascript
window.testServerConnection()
```

### 步骤4: 测试Tauri登录
在控制台中执行：
```javascript
window.testTauriLogin()
```

### 步骤5: 打开调试面板
- 点击右上角的"Show Debug"按钮
- 观察Auth State部分的状态

### 步骤6: 尝试登录
- 使用测试账号：`alice@example.com` / `password123`
- 观察控制台输出
- 查看调试面板的状态变化

### 步骤7: 检查状态
在控制台中执行：
```javascript
window.debugTools.checkAuthState()
```

### 步骤8: 分析问题
根据输出结果分析：
- 如果 `isAuthenticated` 为 `false`：登录失败
- 如果 `isInitialized` 为 `false`：初始化问题
- 如果 `isLoggedIn` 为 `false`：状态计算问题
- 如果返回的数据结构不正确：后端响应问题
- 如果HTTP 400错误：服务器未启动或配置错误

## 常见问题解决

### 问题1: 页面不跳转
**解决方案：**
1. 检查调试面板中的Auth State
2. 执行 `window.debugTools.checkAuthState()`
3. 查看控制台错误信息

### 问题2: 状态不同步
**解决方案：**
1. 执行 `window.debugTools.clearAuthState()`
2. 重新登录
3. 观察状态变化

### 问题3: 网络连接问题
**解决方案：**
1. 执行 `window.debugTools.checkNetwork()`
2. 检查本地服务器是否运行
3. 确认端口1420是否被占用

### 问题4: Tauri配置错误
**解决方案：**
1. 检查 `tauri.conf.json` 文件格式
2. 确保使用正确的Tauri 2.x语法
3. 重启应用程序

## 调试技巧

### 1. 使用断点
- 在Sources标签页中设置断点
- 单步执行代码
- 查看变量值

### 2. 监控网络请求
- 在Network标签页中查看请求
- 检查请求状态和响应
- 分析请求时间

### 3. 性能分析
- 在Performance标签页中记录
- 分析渲染性能
- 检查内存使用

### 4. 本地存储检查
- 在Application标签页中查看
- 检查auth-storage项
- 确认数据完整性

## 日志分析

### 控制台日志级别
- `console.log`: 一般信息
- `console.warn`: 警告信息
- `console.error`: 错误信息

### 关键日志信息
```
Development mode enabled          // 开发模式启动
Initializing auth state: {...}    // 初始化认证状态
Auth state: {...}                 // 认证状态变化
Starting login process...         // 开始登录
Login successful, updating state: {...}  // 登录成功
Auth state changed, isAuthenticated: true  // 状态变化
Showing main app - user authenticated     // 显示主应用
```

## 故障排除

### 1. 重启应用程序
```cmd
# 停止当前进程 (Ctrl+C)
# 重新启动
start.bat
```

### 2. 清除缓存
```javascript
// 在控制台中执行
window.debugTools.clearAuthState()
```

### 3. 重新安装依赖
```bash
rm -rf node_modules
npm install
```

### 4. 检查端口
```bash
# 检查端口1420是否被占用
netstat -ano | findstr :1420
```

### 5. 修复Tauri配置
如果遇到配置错误，请检查：
- `tauri.conf.json` 文件格式
- 确保使用正确的Tauri 2.x语法
- 移除不支持的属性

## 联系支持

如果问题仍然存在，请提供以下信息：
1. 控制台错误信息截图
2. 调试面板状态截图
3. 网络请求日志
4. 本地存储内容
5. 操作系统和Node.js版本

## 相关文档

- [DEBUG_GUIDE.md](./DEBUG_GUIDE.md) - 详细调试指南
- [API文档](./API_DOCUMENTATION.md) - API接口文档
- [测试指南](./TESTING.md) - 测试相关文档

## Channel功能重新添加

### 功能说明
Channel功能已重新添加，用于实时消息接收和事件处理。

### 版本兼容性
- **前端**: `@tauri-apps/api` 2.3.0
- **后端**: `tauri` 2.3.0
- **插件**: `tauri-plugin-opener` 2.3.0

### 测试方法

#### 1. 测试Channel功能
```javascript
window.testChannel()
```

#### 2. 测试JWT Token比较
```javascript
window.testJwtComparison()
```

#### 3. 测试直接WebSocket连接
```javascript
window.testDirectWebSocket()
```

### WebSocket连接问题排查

#### 问题现象
- test_message_sending工具: ✅ WebSocket连接成功
- Cherry应用: ❌ HTTP 400 Bad Request

#### 可能原因
1. **JWT Token问题**: Token格式、过期时间、签名等
2. **WebSocket握手问题**: 请求头、协议版本等
3. **服务器配置问题**: CORS、认证逻辑等

#### 排查步骤
1. 检查JWT token是否有效
2. 比较两个工具的token差异
3. 查看详细的WebSocket连接日志
4. 检查服务器端认证逻辑

### 调试日志
启用详细日志：
```bash
RUST_LOG=debug npm run tauri dev
```

## 认证问题修复 