// 测试Channel功能
// 在Chrome开发者工具的控制台中执行

async function testChannel() {
  console.log('=== 测试Channel功能 ===');
  
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
      console.log('📨 收到Channel消息:', message);
      
      // 根据消息类型处理
      switch (message.type) {
        case 'message':
          console.log('💬 新消息:', message.message);
          break;
        case 'event':
          console.log('🎯 新事件:', message.event);
          break;
        default:
          console.log('❓ 未知消息类型:', message);
      }
    };
    
    console.log('🔐 尝试登录以测试Channel...');
    
    // 调用登录命令
    const result = await window.__TAURI__.invoke('cmd_login', {
      email: 'alice@example.com',
      password: 'password123',
      onEvent
    });
    
    console.log('✅ 登录成功!');
    console.log('📋 返回结果:', result);
    
    // 等待一段时间接收消息
    console.log('⏳ 等待接收消息...');
    setTimeout(() => {
      console.log('✅ Channel测试完成');
    }, 5000);
    
  } catch (error) {
    console.error('❌ Channel测试失败:', error);
    console.error('错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// 监听全局cherry-message事件
function listenToCherryMessages() {
  console.log('🎧 开始监听cherry-message事件...');
  
  window.addEventListener('cherry-message', (event) => {
    console.log('📡 收到cherry-message事件:', event.detail);
  });
  
  console.log('✅ cherry-message事件监听器已设置');
}

// 导出到全局
window.testChannel = testChannel;
window.listenToCherryMessages = listenToCherryMessages;

console.log('Channel测试脚本已加载');
console.log('执行 window.testChannel() 测试Channel功能');
console.log('执行 window.listenToCherryMessages() 监听全局事件'); 