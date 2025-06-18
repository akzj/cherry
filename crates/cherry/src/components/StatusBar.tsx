import React from 'react';
import { User } from '../types/types';
import styled from 'styled-components';

interface StatusBarProps {
  currentUser: User;
}

const StatusBarContainer = styled.div`
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #444;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const StatusIndicator = styled.div<{ status: string }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #333;
    background-color: ${({ status }) => ({
    online: 'green',
    offline: 'gray',
    away: 'yellow',
  }[status])};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.p`
  font-weight: bold;
  margin: 0;
`;

const UserStatus = styled.p`
  font-size: 12px;
  color: #888;
  text-transform: capitalize;
  margin: 0;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #fff;
  }
`;

const ActionIcon = styled.svg`
  width: 20px;
  height: 20px;
  fill: currentColor;
`;

const StatusBar: React.FC<StatusBarProps> = ({ currentUser }) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
  };

  return (
    <StatusBarContainer>
      <AvatarContainer>
        <div className="relative">
          <Avatar src={currentUser.avatar} alt={currentUser.name} />
          <StatusIndicator status={currentUser.status} />
        </div>
        <UserInfo>
          <UserName>{currentUser.name}</UserName>
          <UserStatus>{currentUser.status}</UserStatus>
        </UserInfo>
      </AvatarContainer>

      <div className="flex items-center gap-4">
        <ActionButton>
          <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </ActionIcon>
        </ActionButton>

        <ActionButton>
          <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </ActionIcon>
        </ActionButton>
      </div>
    </StatusBarContainer>
  );
};

export default StatusBar;