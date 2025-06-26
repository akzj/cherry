// 测试登录修复的脚本
// 在Chrome开发者工具的控制台中执行

async function testLoginFix() {
  console.log('=== 测试登录修复 ===');
  
  try {
    // 检查Tauri API是否可用
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
    
    console.log('🔐 尝试登录...');
    
    // 调用登录命令
    const result = await window.__TAURI__.invoke('cmd_login', {
      email: 'alice@example.com',
      password: 'password123',
      onEvent
    });
    
    console.log('✅ 登录成功!');
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
    
    // 检查本地存储
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      console.log('💾 本地存储:', authData);
      
      if (authData.isAuthenticated && authData.user && authData.token) {
        console.log('✅ 本地存储状态正确');
      } else {
        console.error('❌ 本地存储状态不正确');
      }
    } else {
      console.error('❌ 本地存储为空');
    }
    
  } catch (error) {
    console.error('❌ 登录测试失败:', error);
    console.error('错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// 导出到全局
window.testLoginFix = testLoginFix;

console.log('测试脚本已加载，执行 window.testLoginFix() 开始测试'); 