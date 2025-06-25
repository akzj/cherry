// 测试消息接收功能的脚本
import { invoke, Channel } from '@tauri-apps/api/core';
import { CherryMessage } from './types/types';

async function testMessageReceiving() {
  console.log('开始测试消息接收功能...');
  
  try {
    // 创建事件通道
    const onEvent = new Channel<CherryMessage>();
    
    // 设置事件监听器
    onEvent.onmessage = (message) => {
      console.log('✅ 成功接收到消息:', message);
      
      if ('Message' in message) {
        console.log('📨 收到聊天消息:', message.Message);
      } else if ('Event' in message) {
        console.log('📢 收到流事件:', message.Event);
      }
    };
    
    // 调用登录命令
    console.log('🔐 尝试登录...');
    const userInfo = await invoke('cmd_login', {
      email: 'alice@example.com',
      password: 'password123',
      onEvent
    });
    
    console.log('✅ 登录成功:', userInfo);
    console.log('🎉 消息接收功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 如果直接运行此脚本
if (typeof window !== 'undefined') {
  // 在浏览器环境中，将测试函数挂载到全局对象
  (window as any).testMessageReceiving = testMessageReceiving;
  console.log('测试函数已挂载到 window.testMessageReceiving');
}

export { testMessageReceiving }; 