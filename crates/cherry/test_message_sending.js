// 测试消息发送功能的脚本
const { invoke } = require('@tauri-apps/api/core');

// 测试发送消息功能
async function testSendMessage() {
  console.log('开始测试消息发送功能...');
  
  try {
    // 首先尝试获取会话列表
    console.log('📋 获取会话列表...');
    const conversations = await invoke('cmd_conversation_list_all');
    console.log('✅ 会话列表获取成功:', conversations);
    
    if (conversations.length === 0) {
      console.log('⚠️ 没有找到任何会话，无法测试消息发送');
      return;
    }
    
    // 使用第一个会话进行测试
    const conversationId = conversations[0].conversation_id;
    console.log('🎯 使用会话进行测试:', conversationId);
    
    // 测试发送普通消息
    console.log('📤 发送普通消息...');
    await invoke('cmd_send_message', {
      conversationId: conversationId,
      content: 'Hello from test script!',
      messageType: 'text'
    });
    console.log('✅ 普通消息发送成功');
    
    // 测试发送带表情的消息
    console.log('😊 发送表情消息...');
    await invoke('cmd_send_message', {
      conversationId: conversationId,
      content: 'Hello with emoji! 😊 🎉',
      messageType: 'text'
    });
    console.log('✅ 表情消息发送成功');
    
    // 测试发送长消息
    console.log('📝 发送长消息...');
    const longMessage = 'This is a long message to test if the system can handle longer content properly. '.repeat(5);
    await invoke('cmd_send_message', {
      conversationId: conversationId,
      content: longMessage,
      messageType: 'text'
    });
    console.log('✅ 长消息发送成功');
    
    console.log('🎉 所有消息发送测试完成！');
    
  } catch (error) {
    console.error('❌ 消息发送测试失败:', error);
    
    // 详细错误信息
    if (error.message) {
      console.error('错误消息:', error.message);
    }
    if (error.code) {
      console.error('错误代码:', error.code);
    }
  }
}

// 测试发送回复消息
async function testSendReplyMessage() {
  console.log('开始测试回复消息功能...');
  
  try {
    // 获取会话列表
    const conversations = await invoke('cmd_conversation_list_all');
    
    if (conversations.length === 0) {
      console.log('⚠️ 没有找到任何会话，无法测试回复消息');
      return;
    }
    
    const conversationId = conversations[0].conversation_id;
    
    // 先发送一条消息
    console.log('📤 发送原始消息...');
    await invoke('cmd_send_message', {
      conversationId: conversationId,
      content: 'This is the original message to reply to',
      messageType: 'text'
    });
    
    // 等待一下再发送回复
    console.log('⏳ 等待1秒...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 发送回复消息
    console.log('↩️ 发送回复消息...');
    await invoke('cmd_send_message', {
      conversationId: conversationId,
      content: 'This is a reply to the original message',
      messageType: 'text',
      replyTo: 1 // 假设第一条消息的ID是1
    });
    
    console.log('✅ 回复消息发送成功');
    
  } catch (error) {
    console.error('❌ 回复消息测试失败:', error);
  }
}

// 测试错误情况
async function testErrorCases() {
  console.log('开始测试错误情况...');
  
  try {
    // 测试无效的会话ID
    console.log('🔍 测试无效会话ID...');
    try {
      await invoke('cmd_send_message', {
        conversationId: 'invalid-uuid',
        content: 'This should fail',
        messageType: 'text'
      });
      console.log('❌ 应该失败但没有失败');
    } catch (error) {
      console.log('✅ 正确捕获了无效会话ID错误:', error.message);
    }
    
    // 测试空消息内容
    console.log('🔍 测试空消息内容...');
    try {
      const conversations = await invoke('cmd_conversation_list_all');
      if (conversations.length > 0) {
        await invoke('cmd_send_message', {
          conversationId: conversations[0].conversation_id,
          content: '',
          messageType: 'text'
        });
        console.log('❌ 应该失败但没有失败');
      }
    } catch (error) {
      console.log('✅ 正确捕获了空消息错误:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 错误情况测试失败:', error);
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🚀 开始运行所有消息发送测试...\n');
  
  await testSendMessage();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testSendReplyMessage();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testErrorCases();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('🎉 所有测试完成！');
}

// 如果直接运行此脚本
if (typeof window === 'undefined') {
  // Node.js 环境
  runAllTests().catch(console.error);
} else {
  // 浏览器环境
  window.testMessageSending = {
    testSendMessage,
    testSendReplyMessage,
    testErrorCases,
    runAllTests
  };
  
  console.log('消息发送测试函数已加载到 window.testMessageSending');
}

module.exports = {
  testSendMessage,
  testSendReplyMessage,
  testErrorCases,
  runAllTests
}; 