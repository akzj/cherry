// 测试回复显示功能
import { useMessageStore } from './store/message';
import { Message } from './types/types';

export const testReplyDisplay = () => {
  const { addMessage } = useMessageStore.getState();
  
  const testConversationId = 'test-conversation-1';
  
  // 创建测试消息
  const message1: Message = {
    id: 1,
    userId: 'user1',
    content: '这是第一条消息',
    timestamp: new Date().toISOString(),
    type: 'text'
  };
  
  const message2: Message = {
    id: 2,
    userId: 'user2',
    content: '这是第二条消息',
    timestamp: new Date().toISOString(),
    type: 'text'
  };
  
  const replyMessage: Message = {
    id: 3,
    userId: 'user1',
    content: '这是一条回复消息',
    timestamp: new Date().toISOString(),
    type: 'text',
    reply_to: 1,
    isReply: true,
    replyToMessage: message1
  };
  
  // 添加消息到store
  addMessage(testConversationId, message1);
  addMessage(testConversationId, message2);
  addMessage(testConversationId, replyMessage);
  
  console.log('测试回复显示功能：已添加测试消息');
  console.log('会话ID:', testConversationId);
  console.log('消息:', useMessageStore.getState().getMessages(testConversationId));
};

// 挂载到window对象以便在控制台中调用
if (typeof window !== 'undefined') {
  (window as any).testReplyDisplay = testReplyDisplay;
  console.log('测试函数已挂载到 window.testReplyDisplay');
} 