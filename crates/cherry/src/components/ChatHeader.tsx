// src/components/ChatHeader.tsx
import React from 'react';
import styled from 'styled-components';
import { Conversation } from '../types/types';

interface ChatHeaderProps {
  conversation: Conversation;
}

// ==================== Styled Components ====================
const HeaderContainer = styled.div`
  background-color: #1f2937;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #374151;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const Avatar = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  object-fit: cover;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background-color: #10b981;
  border: 2px solid #1f2937;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.h2`
  font-weight: 500;
  font-size: 1rem;
  margin: 0;
  color: #f9fafb;
`;

const OnlineStatus = styled.p`
  font-size: 0.75rem;
  margin: 0;
  color: #9ca3af;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const IconButton = styled.button`
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  
  &:hover {
    color: #f3f4f6;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
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
