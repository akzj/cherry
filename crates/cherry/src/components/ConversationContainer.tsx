import React from 'react';
import styled from 'styled-components';
import { Conversation } from '../types/types';
import ConversationView from './ConversationView';

interface ConversationContainerProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  currentUserId: string;
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
}) => {
  //console.log('ConversationContainer render:', {
  //  conversationCount: conversations.length,
  //  selectedConversationId,
  //  conversationIds: conversations.map(c => c.id)
  //});



  return (
    <Container>
      {conversations.map((conversation) => (
        <ConversationView
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          isVisible={conversation.id === selectedConversationId}
        />
      ))}
    </Container>
  );
};

export default ConversationContainer; 