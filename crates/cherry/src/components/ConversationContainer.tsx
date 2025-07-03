import React from 'react';
import styled from 'styled-components';
import { Conversation } from '../types/types';
import ConversationView from './ConversationView';

interface ConversationContainerProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  currentUserId: string;
  onSendMessage: (conversationId: string, content: string, messageType: string, replyTo?: number) => Promise<void>;
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
    return async (content: string, messageType: string, replyTo?: number) => {
      await onSendMessage(conversationId, content, messageType, replyTo);
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
    </Container>
  );
};

export default ConversationContainer; 