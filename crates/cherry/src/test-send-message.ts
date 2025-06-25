// 测试发送消息功能的脚本
import { invoke } from '@tauri-apps/api/core';

async function testSendMessage() {
  console.log('开始测试发送消息功能...');
  
  try {
    // 测试发送消息
    console.log('📤 尝试发送消息...');
    await invoke('cmd_send_message', {
      conversationId: 'test-conversation-id',
      content: 'Hello from test script!',
      messageType: 'text'
    });
    
    console.log('✅ 消息发送成功！');
    
  } catch (error) {
    console.error('❌ 发送消息失败:', error);
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