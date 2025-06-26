// 测试服务器连接和登录功能
// 在Chrome开发者工具的控制台中执行

async function testServerConnection() {
  console.log('=== 测试服务器连接 ===');
  
  try {
    // 测试CherryServer连接
    console.log('🔍 测试CherryServer连接...');
    const cherryResponse = await fetch('http://localhost:8180/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email',
        email: 'alice@example.com',
        password: 'password123'
      })
    });
    
    console.log('CherryServer响应状态:', cherryResponse.status);
    
    if (cherryResponse.ok) {
      const cherryData = await cherryResponse.json();
      console.log('✅ CherryServer登录成功:', cherryData);
    } else {
      const errorText = await cherryResponse.text();
      console.error('❌ CherryServer登录失败:', errorText);
    }
    
    // 测试StreamServer连接
    console.log('🔍 测试StreamServer连接...');
    const streamResponse = await fetch('http://localhost:8080/health');
    
    console.log('StreamServer响应状态:', streamResponse.status);
    
    if (streamResponse.ok) {
      const streamData = await streamResponse.text();
      console.log('✅ StreamServer连接成功:', streamData);
    } else {
      console.error('❌ StreamServer连接失败');
    }
    
  } catch (error) {
    console.error('❌ 连接测试失败:', error);
  }
}

async function testTauriLogin() {
  console.log('=== 测试Tauri登录 ===');
  
  try {
    if (typeof window.__TAURI__ === 'undefined') {
      console.error('❌ Tauri API 不可用');
      return;
    }
    
    console.log('✅ Tauri API 可用');
    
    // 创建事件通道
    const onEvent = new window.__TAURI__.Channel();
    
    // 设置事件监听器
    onEvent.onmessage = (message) => {
      console.log('📨 收到后端消息:', message);
    };
    
    console.log('🔐 尝试Tauri登录...');
    
    // 调用登录命令
    const result = await window.__TAURI__.invoke('cmd_login', {
      email: 'alice@example.com',
      password: 'password123',
      onEvent
    });
    
    console.log('✅ Tauri登录成功!');
    console.log('📋 返回结果:', result);
    
    // 检查返回的数据结构
    if (result && result.user_id && result.jwt_token) {
      console.log('✅ 数据结构正确');
      console.log('👤 用户ID:', result.user_id);
      console.log('🔑 JWT Token:', result.jwt_token.substring(0, 20) + '...');
      console.log('📧 邮箱:', result.email);
      console.log('👤 用户名:', result.username);
    } else {
      console.error('❌ 数据结构不正确');
      console.log('实际返回:', result);
    }
    
  } catch (error) {
    console.error('❌ Tauri登录失败:', error);
    console.error('错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// 导出到全局
window.testServerConnection = testServerConnection;
window.testTauriLogin = testTauriLogin;

console.log('服务器连接测试脚本已加载');
console.log('执行 window.testServerConnection() 测试服务器连接');
console.log('执行 window.testTauriLogin() 测试Tauri登录'); 