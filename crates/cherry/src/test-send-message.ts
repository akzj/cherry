// 测试发送消息功能的脚本
import { invoke, Channel } from '@tauri-apps/api/core';
import { CherryMessage } from './types/types';

// 测试消息接收功能
async function testMessageReceiving() {
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

// 测试发送普通消息
export async function testSendMessage() {
  try {
    const result = await invoke('cmd_send_message', {
      conversationId: 'test-conversation-1',
      content: 'Hello from frontend!',
      messageType: 'text'
    });
    console.log('Message sent successfully:', result);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}

// 测试发送回复消息
export async function testSendReplyMessage() {
  try {
    const result = await invoke('cmd_send_message', {
      conversationId: 'test-conversation-1',
      content: 'This is a reply message!',
      messageType: 'text',
      replyTo: 1 // 回复消息ID为1的消息
    });
    console.log('Reply message sent successfully:', result);
  } catch (error) {
    console.error('Failed to send reply message:', error);
  }
}

// 测试发送带回复的消息
export async function testSendMessageWithReply() {
  try {
    // 先发送一条消息
    const firstMessage = await invoke('cmd_send_message', {
      conversationId: 'test-conversation-1',
      content: 'First message to reply to',
      messageType: 'text'
    });
    console.log('First message sent:', firstMessage);

    // 等待一下再发送回复
    setTimeout(async () => {
      try {
        const replyMessage = await invoke('cmd_send_message', {
          conversationId: 'test-conversation-1',
          content: 'This is a reply to the first message',
          messageType: 'text',
          replyTo: 1 // 假设第一条消息的ID是1
        });
        console.log('Reply message sent:', replyMessage);
      } catch (error) {
        console.error('Failed to send reply:', error);
      }
    }, 1000);

  } catch (error) {
    console.error('Failed to send message with reply:', error);
  }
}

// 导出所有测试函数
export { testMessageReceiving };

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中，挂载到全局对象
  (window as any).testSendMessage = testSendMessage;
  (window as any).testSendReplyMessage = testSendReplyMessage;
  (window as any).testSendMessageWithReply = testSendMessageWithReply;
  (window as any).testMessageReceiving = testMessageReceiving;
  console.log('测试函数已挂载到 window 对象');
} 