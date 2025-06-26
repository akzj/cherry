// 测试JWT token比较和WebSocket连接
// 在Chrome开发者工具的控制台中执行

async function testJwtComparison() {
  console.log('=== 测试JWT Token比较 ===');
  
  try {
    if (typeof window.__TAURI__ === 'undefined') {
      console.error('❌ Tauri API 不可用');
      return;
    }
    
    console.log('✅ Tauri API 可用');
    
    // 1. 获取当前认证状态
    console.log('1. 检查当前认证状态...');
    const authState = window.useAuthStore.getState();
    console.log('当前认证状态:', {
      isAuthenticated: authState.isAuthenticated,
      token: authState.token ? authState.token.substring(0, 50) + '...' : null,
      user: authState.user
    });
    
    if (!authState.token) {
      console.log('❌ 没有JWT token，需要先登录');
      return;
    }
    
    // 2. 解析JWT token
    console.log('2. 解析JWT token...');
    const tokenParts = authState.token.split('.');
    if (tokenParts.length === 3) {
      try {
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('JWT Header:', header);
        console.log('JWT Payload:', payload);
        
        // 检查token是否过期
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.error('❌ JWT token已过期');
        } else {
          console.log('✅ JWT token有效');
        }
      } catch (e) {
        console.error('❌ JWT token解析失败:', e);
      }
    }
    
    // 3. 测试WebSocket连接
    console.log('3. 测试WebSocket连接...');
    const onEvent = new window.__TAURI__.Channel();
    
    onEvent.onmessage = (message) => {
      console.log('📨 收到Channel消息:', message);
    };
    
    try {
      const result = await window.__TAURI__.invoke('cmd_login', {
        email: 'alice@example.com',
        password: 'password123',
        onEvent
      });
      
      console.log('✅ 登录成功，WebSocket连接应该已建立');
      console.log('返回结果:', result);
      
    } catch (error) {
      console.error('❌ 登录失败:', error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 测试直接WebSocket连接
async function testDirectWebSocket() {
  console.log('=== 测试直接WebSocket连接 ===');
  
  try {
    const authState = window.useAuthStore.getState();
    if (!authState.token) {
      console.error('❌ 没有JWT token');
      return;
    }
    
    const wsUrl = 'ws://localhost:8080/api/v1/stream/read';
    console.log('连接到:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket连接已打开');
      
      // 发送认证头
      const authMessage = {
        type: 'auth',
        token: authState.token
      };
      ws.send(JSON.stringify(authMessage));
    };
    
    ws.onmessage = (event) => {
      console.log('📨 收到消息:', event.data);
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket错误:', error);
    };
    
    ws.onclose = (event) => {
      console.log('🔌 WebSocket连接关闭:', event.code, event.reason);
    };
    
    // 5秒后关闭连接
    setTimeout(() => {
      ws.close();
    }, 5000);
    
  } catch (error) {
    console.error('❌ 直接WebSocket测试失败:', error);
  }
}

// 导出到全局
window.testJwtComparison = testJwtComparison;
window.testDirectWebSocket = testDirectWebSocket;

console.log('JWT比较测试脚本已加载');
console.log('执行 window.testJwtComparison() 比较JWT token');
console.log('执行 window.testDirectWebSocket() 测试直接WebSocket连接'); 