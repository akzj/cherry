// 测试发送消息功能的脚本
import { invoke, Channel } from '@tauri-apps/api/core';
import { CherryMessage } from './types/types';

async function testSendMessage() {
  console.log('开始测试发送消息功能...');
  
  try {
    // 创建事件通道
    const onEvent = new Channel<CherryMessage>();
    
    // 设置事件监听器
    onEvent.onmessage = (message) => {
      console.log('✅ 成功接收到消息:', message);
      
      if ('Message' in message) {
        const { message: backendMessage, conversation_id } = message.Message;
        console.log('📨 收到聊天消息:', backendMessage);
        console.log('💬 会话ID:', conversation_id);
      } else if ('Event' in message) {
        const { event: streamEvent } = message.Event;
        console.log('📢 收到流事件:', streamEvent);
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

// 导出测试函数
export { testSendMessage };

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中，挂载到全局对象
  (window as any).testSendMessage = testSendMessage;
  console.log('测试函数已挂载到 window.testSendMessage');
} 