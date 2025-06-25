import React, { useState } from 'react';
import styled from 'styled-components';
import { useMessageStore } from '../store/message';
import { useConversationStore } from '../store/conversation';
import { Message } from '../types/types';

const TestContainer = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin: 20px;
  backdrop-filter: blur(10px);
`;

const TestButton = styled.button`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin: 5px;
  font-weight: 600;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const MessageList = styled.div`
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
`;

const MessageItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  margin: 5px 0;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
`;

const MessageTest: React.FC = () => {
  const { messages, addMessage, clearMessages } = useMessageStore();
  const { conversations } = useConversationStore();
  const [testMessage, setTestMessage] = useState('');

  const handleAddTestMessage = () => {
    if (!testMessage.trim() || conversations.length === 0) return;
    
    const conversationId = conversations[0].id;
    const newMessage: Message = {
      id: Date.now(),
      userId: 'test-user',
      content: testMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    addMessage(conversationId, newMessage);
    setTestMessage('');
  };

  const handleClearMessages = () => {
    if (conversations.length === 0) return;
    const conversationId = conversations[0].id;
    clearMessages(conversationId);
  };

  const currentConversationId = conversations.length > 0 ? conversations[0].id : null;
  const currentMessages = currentConversationId ? messages[currentConversationId] || [] : [];

  return (
    <TestContainer>
      <h3>消息接收测试</h3>
      <p>当前会话: {currentConversationId || '无会话'}</p>
      <p>消息数量: {currentMessages.length}</p>
      
      <div>
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="输入测试消息"
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            marginRight: '10px',
            width: '200px'
          }}
        />
        <TestButton onClick={handleAddTestMessage}>添加测试消息</TestButton>
        <TestButton onClick={handleClearMessages}>清空消息</TestButton>
      </div>
      
      <MessageList>
        <h4>当前会话消息:</h4>
        {currentMessages.map((message) => (
          <MessageItem key={message.id}>
            <div><strong>用户:</strong> {message.userId}</div>
            <div><strong>内容:</strong> {message.content}</div>
            <div><strong>时间:</strong> {new Date(message.timestamp).toLocaleString()}</div>
            <div><strong>类型:</strong> {message.type}</div>
          </MessageItem>
        ))}
      </MessageList>
    </TestContainer>
  );
};

export default MessageTest; 