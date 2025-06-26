# Chrome调试MCP指南

## 概述
本文档介绍如何使用Chrome开发者工具调试Cherry应用程序的登录跳转问题。

## 启动调试模式

### 1. 启动应用程序
```bash
cd crates/cherry
npm run tauri dev
```

### 2. 打开开发者工具
- 在应用程序窗口中，按 `F12` 或 `Ctrl+Shift+I` 打开开发者工具
- 或者右键点击窗口，选择"检查元素"

### 3. 使用调试面板
- 应用程序右上角有一个"Show Debug"按钮
- 点击可以显示/隐藏调试面板
- 调试面板会显示实时的认证状态和日志信息

## 调试步骤

### 1. 检查控制台输出
在开发者工具的Console标签页中，你应该能看到以下调试信息：

```
Development mode enabled
Initializing auth state: {...}
Auth state: {...}
Starting login process...
Login successful, updating state: {...}
Auth state changed, isAuthenticated: true
Showing main app - user authenticated
```

### 2. 检查认证状态
在调试面板中，查看Auth State部分：
- `isAuthenticated`: 是否已认证
- `isInitialized`: 是否已初始化
- `isLoggedIn`: 是否已登录（isAuthenticated && isInitialized）
- `isLoading`: 是否正在加载
- `hasUser`: 是否有用户信息
- `hasToken`: 是否有token

### 3. 检查网络请求
在Network标签页中：
- 查看是否有登录相关的网络请求
- 检查请求的状态码和响应内容
- 确认Tauri命令是否正确执行

### 4. 检查本地存储
在Application标签页中：
- 查看Local Storage中的`auth-storage`项
- 确认认证信息是否正确保存

## 常见问题排查

### 问题1: 登录成功后页面不跳转
**可能原因：**
- `isInitialized` 状态为false
- Zustand状态更新没有触发重新渲染
- 本地存储状态不同步

**解决方案：**
1. 检查调试面板中的Auth State
2. 查看控制台是否有错误信息
3. 检查本地存储中的认证信息

### 问题2: 控制台显示错误
**可能原因：**
- Tauri命令执行失败
- 网络请求失败
- JavaScript运行时错误

**解决方案：**
1. 查看错误堆栈信息
2. 检查Tauri后端日志
3. 确认网络连接正常

### 问题3: 状态更新延迟
**可能原因：**
- Zustand状态更新异步
- React渲染延迟

**解决方案：**
1. 使用调试面板监控状态变化
2. 检查是否有强制重新渲染的机制
3. 确认useEffect依赖项正确

## 调试技巧

### 1. 使用断点
在Sources标签页中：
- 在关键代码行设置断点
- 单步执行代码
- 查看变量值的变化

### 2. 监控状态变化
```javascript
// 在控制台中执行
const authStore = window.__TAURI__.invoke('get_auth_store');
console.log('Current auth state:', authStore);
```

### 3. 手动触发状态更新
```javascript
// 在控制台中执行
window.dispatchEvent(new CustomEvent('force-update'));
```

## 日志级别

### 开发模式日志
- `console.log`: 一般信息
- `console.warn`: 警告信息
- `console.error`: 错误信息

### 调试面板日志
- 实时显示最近的10条日志
- 包含时间戳
- 自动滚动到最新日志

## 性能监控

### 1. 内存使用
在Performance标签页中：
- 监控内存使用情况
- 检查是否有内存泄漏

### 2. 渲染性能
在Performance标签页中：
- 记录页面渲染过程
- 分析渲染瓶颈

## 故障排除

如果遇到问题，请按以下步骤排查：

1. **重启应用程序**
   ```bash
   npm run tauri dev
   ```

2. **清除本地存储**
   - 在开发者工具中删除Local Storage
   - 重新登录

3. **检查依赖**
   ```bash
   npm install
   ```

4. **查看Tauri日志**
   - 检查终端输出
   - 查看Rust后端日志

## 联系支持

如果问题仍然存在，请提供以下信息：
- 控制台错误信息
- 调试面板截图
- 网络请求日志
- 本地存储内容 