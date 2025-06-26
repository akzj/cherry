// 快速调试脚本
// 在Chrome开发者工具的控制台中执行这些命令

// 1. 检查认证状态
function checkAuthState() {
  console.log('=== 认证状态检查 ===');
  console.log('当前时间:', new Date().toLocaleString());
  
  // 检查本地存储
  const authStorage = localStorage.getItem('auth-storage');
  console.log('本地存储:', authStorage ? JSON.parse(authStorage) : 'null');
  
  // 检查全局状态
  if (window.__TAURI__) {
    console.log('Tauri API 可用');
  } else {
    console.log('Tauri API 不可用');
  }
  
  // 检查React组件状态
  const rootElement = document.getElementById('root');
  if (rootElement) {
    console.log('React根元素存在');
  } else {
    console.log('React根元素不存在');
  }
}

// 2. 强制重新渲染
function forceRerender() {
  console.log('=== 强制重新渲染 ===');
  window.dispatchEvent(new CustomEvent('force-update'));
  console.log('已触发强制重新渲染事件');
}

// 3. 清除认证状态
function clearAuthState() {
  console.log('=== 清除认证状态 ===');
  localStorage.removeItem('auth-storage');
  console.log('已清除本地存储的认证信息');
  location.reload();
}

// 4. 模拟登录
function simulateLogin() {
  console.log('=== 模拟登录 ===');
  const mockUser = {
    user_id: 'test-user',
    username: 'Test User',
    email: 'test@example.com',
    status: 'online'
  };
  
  const mockToken = 'mock-jwt-token';
  
  const authData = {
    isAuthenticated: true,
    user: mockUser,
    token: mockToken,
    isInitialized: true
  };
  
  localStorage.setItem('auth-storage', JSON.stringify(authData));
  console.log('已设置模拟认证数据:', authData);
  location.reload();
}

// 5. 检查网络连接
function checkNetwork() {
  console.log('=== 网络连接检查 ===');
  
  // 检查是否能访问本地服务器
  fetch('http://localhost:1420')
    .then(response => {
      console.log('本地服务器响应:', response.status, response.statusText);
    })
    .catch(error => {
      console.error('本地服务器连接失败:', error);
    });
}

// 6. 监控状态变化
function monitorStateChanges() {
  console.log('=== 开始监控状态变化 ===');
  
  let lastState = null;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        console.log('DOM变化:', mutation);
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('DOM变化监控已启动');
}

// 7. 检查错误
function checkErrors() {
  console.log('=== 错误检查 ===');
  
  // 检查控制台错误
  const originalError = console.error;
  console.error = (...args) => {
    originalError.apply(console, args);
    console.log('捕获到错误:', args);
  };
  
  // 检查未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    console.log('未处理的Promise拒绝:', event.reason);
  });
  
  console.log('错误监控已启动');
}

// 8. 性能检查
function checkPerformance() {
  console.log('=== 性能检查 ===');
  
  console.log('页面加载时间:', performance.timing.loadEventEnd - performance.timing.navigationStart, 'ms');
  console.log('DOM内容加载时间:', performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart, 'ms');
  
  // 检查内存使用
  if (performance.memory) {
    console.log('内存使用:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    });
  }
}

// 9. 运行所有检查
function runAllChecks() {
  console.log('=== 开始全面检查 ===');
  checkAuthState();
  checkNetwork();
  checkErrors();
  checkPerformance();
  console.log('=== 检查完成 ===');
}

// 10. 导出函数到全局
window.debugTools = {
  checkAuthState,
  forceRerender,
  clearAuthState,
  simulateLogin,
  checkNetwork,
  monitorStateChanges,
  checkErrors,
  checkPerformance,
  runAllChecks
};

console.log('调试工具已加载，使用 window.debugTools 访问');
console.log('例如: window.debugTools.runAllChecks()'); 