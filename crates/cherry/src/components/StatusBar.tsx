import React from 'react';
import { User } from '../types/types';
import styled, { keyframes } from 'styled-components';

interface StatusBarProps {
  currentUser: User;
}

// ==================== Animations ====================
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
`;

// ==================== Styled Components ====================
const StatusBarContainer = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95));
  backdrop-filter: blur(20px);
  color: #1f2937;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  position: relative;
  z-index: 100;
`;

const AvatarContainer = styled.div`
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

const AvatarWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
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

const StatusIndicator = styled.div<{ status: string }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  background: ${({ status }) => {
    const colors: Record<string, string> = {
      online: 'linear-gradient(135deg, #10b981, #059669)',
      offline: 'linear-gradient(135deg, #6b7280, #4b5563)',
      away: 'linear-gradient(135deg, #f59e0b, #d97706)',
      dnd: 'linear-gradient(135deg, #ef4444, #dc2626)',
      busy: 'linear-gradient(135deg, #ef4444, #dc2626)',
    };
    return colors[status] || colors.offline;
  }};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: ${pulse} 2s infinite;
  z-index: 10;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.p`
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
  letter-spacing: 0.025em;
  color: #1f2937;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const UserStatus = styled.p<{ status: string }>`
  font-size: 0.875rem;
  text-transform: capitalize;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 500;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ status }) => {
    const colors: Record<string, string> = {
      online: 'linear-gradient(135deg, #10b981, #059669)',
      offline: 'linear-gradient(135deg, #6b7280, #4b5563)',
      away: 'linear-gradient(135deg, #f59e0b, #d97706)',
      dnd: 'linear-gradient(135deg, #ef4444, #dc2626)',
      busy: 'linear-gradient(135deg, #ef4444, #dc2626)',
    };
    return colors[status] || colors.offline;
  }};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
    animation: ${float} 1.5s ease-in-out infinite;
    
    svg {
      transform: scale(1.1);
      fill: #6366f1;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -6px;
    right: -6px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &.has-notification::after {
    opacity: 1;
    animation: ${pulse} 1.5s infinite;
  }
`;

const ActionIcon = styled.svg`
  width: 22px;
  height: 22px;
  fill: #6b7280;
  transition: all 0.3s ease;
`;

// ==================== Component Implementation ====================
const StatusBar: React.FC<StatusBarProps> = ({ currentUser }) => {
  // 模拟通知状态
  const hasNotifications = true;
  const hasMessages = false;

  return (
    <StatusBarContainer>
      <AvatarContainer>
        <AvatarWrapper>
          <Avatar src={currentUser.avatar} alt={currentUser.name} />
          <StatusIndicator status={currentUser.status} />
        </AvatarWrapper>
        <UserInfo>
          <UserName>{currentUser.name}</UserName>
          <UserStatus status={currentUser.status}>{currentUser.status}</UserStatus>
        </UserInfo>
      </AvatarContainer>

      <ActionContainer>

        
        <ActionButton className={hasNotifications ? 'has-notification' : ''}>
          <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </ActionIcon>
        </ActionButton>

        <ActionButton className={hasMessages ? 'has-notification' : ''}>
          <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </ActionIcon>
        </ActionButton>

        <ActionButton>
          <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </ActionIcon>
        </ActionButton>
      </ActionContainer>
    </StatusBarContainer>
  );
};

export default StatusBar;
