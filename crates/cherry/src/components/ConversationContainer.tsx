import React from 'react';
import styled from 'styled-components';
import { Conversation } from '../types/types';
import ConversationView from './ConversationView';

interface ConversationContainerProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  currentUserId: string;
  onSendMessage: (conversationId: string, content: string, replyTo?: number) => Promise<void>;
}

const Container = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ConversationContainer: React.FC<ConversationContainerProps> = ({
  conversations,
  selectedConversationId,
  currentUserId,
  onSendMessage
}) => {
  console.log('ConversationContainer render:', {
    conversationCount: conversations.length,
    selectedConversationId,
    conversationIds: conversations.map(c => c.id)
  });

  // 为每个会话创建发送消息的处理函数
  const createSendMessageHandler = (conversationId: string) => {
    return async (content: string, replyTo?: number) => {
      await onSendMessage(conversationId, content, replyTo);
    };
  };

  return (
    <Container>
      {conversations.map((conversation) => (
        <ConversationView
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          isVisible={conversation.id === selectedConversationId}
          onSendMessage={createSendMessageHandler(conversation.id)}
        />
      ))}
      
      {/* 如果没有选中任何会话，显示欢迎界面 */}
      {!selectedConversationId && (
        <WelcomeView />
      )}
    </Container>
  );
};

// 欢迎界面组件
const WelcomeContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin: 16px;
  margin-left: 8px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(229, 231, 235, 0.2);
  overflow: hidden;
`;

const WelcomeTitle = styled.h2`
  color: rgba(34, 197, 94, 0.8);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
`;

const WelcomeText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  text-align: center;
  max-width: 400px;
  line-height: 1.5;
`;

const WelcomeView: React.FC = () => (
  <WelcomeContainer>
    <WelcomeTitle>欢迎使用 Cherry Chat</WelcomeTitle>
    <WelcomeText>
      选择一个会话开始聊天，每个会话都会保持独立的滚动位置和状态。
    </WelcomeText>
  </WelcomeContainer>
);

export default ConversationContainer; 