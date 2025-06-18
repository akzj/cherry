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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const MessageBubbleWrapper = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  max-width: 18rem;
  
  @media (min-width: 768px) {
    max-width: 24rem;
  }
  
  @media (min-width: 1024px) {
    max-width: 32rem;
  }
  
  padding: 0.875rem 1.25rem;
  border-radius: 20px;
  position: relative;
  transition: all 0.3s ease;
  
  ${({ $isOwn }) => $isOwn 
    ? `
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border-top-right-radius: 8px;
      box-shadow: 
        0 4px 20px rgba(99, 102, 241, 0.3),
        0 2px 10px rgba(139, 92, 246, 0.2);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 6px 25px rgba(99, 102, 241, 0.4),
          0 3px 15px rgba(139, 92, 246, 0.3);
      }
    ` 
    : `
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-top-left-radius: 8px;
      box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.1),
        0 2px 10px rgba(0, 0, 0, 0.05);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 6px 25px rgba(0, 0, 0, 0.15),
          0 3px 15px rgba(0, 0, 0, 0.1);
      }
    `
  }
`;

const MessageContent = styled.p`
  font-size: 0.875rem;
  line-height: 1.4;
  word-wrap: break-word;
  margin: 0;
  font-weight: 400;
`;

const TimestampContainer = styled.div<{ $isOwn: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
  color: ${({ $isOwn }) => $isOwn ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)'};
  font-weight: 500;
`;

const StatusIndicator = styled.span`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  
  &.sent {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &.delivered {
    color: rgba(255, 255, 255, 0.8);
  }
  
  &.read {
    color: #10b981;
  }
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
                  <StatusIndicator className={message.status}>
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
