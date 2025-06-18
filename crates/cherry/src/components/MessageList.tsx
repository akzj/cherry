// src/components/MessageList.tsx
import React from 'react';
import styled from 'styled-components';
import { Message, User } from '../types/types';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

// ==================== Styled Components ====================
const MessageContainer = styled.div<{ $isOwn: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubbleWrapper = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  max-width: 18rem;
  
  @media (min-width: 768px) {
    max-width: 24rem;
  }
  
  @media (min-width: 1024px) {
    max-width: 32rem;
  }
  
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  position: relative;
  
  ${({ $isOwn }) => $isOwn 
    ? `
      background-color: #3b82f6;
      color: white;
      border-top-right-radius: 0;
    ` 
    : `
      background-color: #e5e7eb;
      border-top-left-radius: 0;
      
      @media (prefers-color-scheme: dark) {
        background-color: #374151;
      }
    `
  }
`;

const MessageContent = styled.p`
  font-size: 0.875rem;
  line-height: 1.25rem;
  word-wrap: break-word;
`;

const TimestampContainer = styled.div<{ $isOwn: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  justify-content: flex-end;
  color: ${({ $isOwn }) => $isOwn ? 'rgba(255, 255, 255, 0.7)' : '#6b7280'};
`;

const StatusIndicator = styled.span`
  margin-left: 0.25rem;
`;

// ==================== Component Implementation ====================
const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  return (
    <MessageContainer $isOwn={false}>
      {messages.map(message => {
        const isOwn = message.userId === currentUser.id;
        
        return (
          <MessageBubbleWrapper key={message.id} $isOwn={isOwn}>
            <MessageBubble $isOwn={isOwn}>
              <MessageContent>{message.content}</MessageContent>
              
              <TimestampContainer $isOwn={isOwn}>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {isOwn && message.status && (
                  <StatusIndicator>
                    {message.status === 'sent' ? '✓' : 
                     message.status === 'delivered' ? '✓✓' : '✓✓✓'}
                  </StatusIndicator>
                )}
              </TimestampContainer>
            </MessageBubble>
          </MessageBubbleWrapper>
        );
      })}
    </MessageContainer>
  );
};

export default MessageList;
