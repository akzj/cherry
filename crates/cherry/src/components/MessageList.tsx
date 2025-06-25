// src/components/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Message } from '../types/types';
import { useMessageStore } from '../store/message';
import ReplyMessage from './ReplyMessage';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  conversationId: string;
}

// ==================== Styled Components ====================
const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: linear-gradient(135deg, #1e1e2e 0%, #181825 100%);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const MessageContainer = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 70%;
  align-self: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div<{ $isOwn: boolean; $isReply?: boolean }>`
  background: ${props => props.$isOwn 
    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  color: ${props => props.$isOwn ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'};
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border-bottom-right-radius: ${props => props.$isOwn ? '0.25rem' : '1rem'};
  border-bottom-left-radius: ${props => props.$isOwn ? '1rem' : '0.25rem'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  max-width: 100%;
  
  ${props => props.$isReply && `
    border-left: 3px solid #6366f1;
    margin-left: 0.5rem;
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
`;

const Username = styled.span`
  font-weight: 600;
  color: #6366f1;
`;

const Timestamp = styled.span`
  font-size: 0.625rem;
  opacity: 0.6;
`;

const MessageContent = styled.div`
  line-height: 1.4;
  white-space: pre-wrap;
`;

const MessageActions = styled.div`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${MessageContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  padding: 0.25rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const ReplyIndicator = styled.div`
  font-size: 0.75rem;
  color: #6366f1;
  margin-bottom: 0.25rem;
  font-style: italic;
`;

// ==================== Component Implementation ====================
const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, conversationId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setReplyingTo } = useMessageStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.userId === currentUserId;
    
    return (
      <MessageContainer key={message.id} $isOwn={isOwn}>
        <MessageBubble $isOwn={isOwn} $isReply={message.isReply}>
          <MessageActions>
            <ActionButton onClick={() => handleReply(message)} title="回复">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,17 15,17 15,11 21,11 21,5 15,5 15,11 9,11"></polyline>
                <path d="M3,13 L3,19 L9,19"></path>
              </svg>
            </ActionButton>
          </MessageActions>
          
          <MessageHeader>
            <Username>{message.userId}</Username>
            <Timestamp>{formatTime(message.timestamp)}</Timestamp>
          </MessageHeader>
          
          {message.isReply && message.replyToMessage && (
            <ReplyIndicator>
              回复 {message.replyToMessage.userId}: {message.replyToMessage.content.substring(0, 30)}...
            </ReplyIndicator>
          )}
          
          <MessageContent>{message.content}</MessageContent>
        </MessageBubble>
      </MessageContainer>
    );
  };

  return (
    <Container>
      {messages.map(renderMessage)}
      <div ref={messagesEndRef} />
    </Container>
  );
};

export default MessageList;
