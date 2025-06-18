// src/components/ChatHeader.tsx
import React from 'react';
import styled from 'styled-components';
import { Conversation } from '../types/types';

interface ChatHeaderProps {
  conversation: Conversation;
}

// ==================== Styled Components ====================
const HeaderContainer = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95));
  backdrop-filter: blur(20px);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const Avatar = styled.img`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(99, 102, 241, 0.3);
  }
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.h2`
  font-weight: 700;
  font-size: 1.125rem;
  margin: 0;
  color: #1f2937;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.025em;
`;

const OnlineStatus = styled.p`
  font-size: 0.875rem;
  margin: 0;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const IconButton = styled.button`
  color: #6b7280;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
    color: #6366f1;
    
    svg {
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
    transition: all 0.3s ease;
  }
`;

// ==================== Component Implementation ====================
const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
  const onlineCount = conversation.participants.filter(p => p.status === 'online').length;

  return (
    <HeaderContainer>
      <UserInfo>
        <AvatarContainer>
          <Avatar 
            src={conversation.avatar} 
            alt={conversation.name} 
          />
          {onlineCount > 0 && <OnlineIndicator />}
        </AvatarContainer>
        
        <UserDetails>
          <UserName>{conversation.name}</UserName>
          <OnlineStatus>{onlineCount} online</OnlineStatus>
        </UserDetails>
      </UserInfo>
      
      <ActionButtons>
        <IconButton aria-label="Start video call">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        </IconButton>
        
        <IconButton aria-label="Conversation information">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </IconButton>
        
        <IconButton aria-label="More options">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </IconButton>
      </ActionButtons>
    </HeaderContainer>
  );
};

export default ChatHeader;
