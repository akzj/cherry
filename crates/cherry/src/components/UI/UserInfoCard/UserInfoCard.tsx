import React, { useRef, useEffect } from 'react';
import {
  CardContainer,
  CardHeader,
  UserInfoSection,
  AvatarContainer,
  LargeAvatar,
  UserName,
  UserStatus,
  UserBio,
  Divider,
  ActionButtons,
  ActionButton,
  UserDetails,
  DetailItem
} from './UserInfoCard.styled';

interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  bio?: string;
  email?: string;
  location?: string;
  joinDate?: string;
}

interface UserInfoCardProps {
  user: UserInfo;
  position: { top: number; left: number };
  onClose: () => void;
  onSendMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  user,
  position,
  onClose,
  onSendMessage,
  onViewProfile
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  console.log('UserInfoCard rendered for user:', user.name, 'at position:', position);
  
  // Ensure the card stays within viewport bounds
  useEffect(() => {
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Check if card is outside viewport and adjust if needed
      if (cardRect.right > viewportWidth) {
        console.log('Card outside right viewport edge, adjusting position');
        cardRef.current.style.left = `${viewportWidth - cardRect.width - 10}px`;
      }
      
      if (cardRect.bottom > viewportHeight) {
        console.log('Card outside bottom viewport edge, adjusting position');
        cardRef.current.style.top = `${viewportHeight - cardRect.height - 10}px`;
      }
      
      if (cardRect.left < 0) {
        console.log('Card outside left viewport edge, adjusting position');
        cardRef.current.style.left = '10px';
      }
      
      if (cardRect.top < 0) {
        console.log('Card outside top viewport edge, adjusting position');
        cardRef.current.style.top = '10px';
      }
    }
  }, [position]);

  // Close card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Format join date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' });
  };

  // Status display
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online': return '在线';
      case 'offline': return '离线';
      case 'away': return '离开';
      case 'busy': return '忙碌';
      default: return '离线';
    }
  };

  const isOnline = user.status === 'online';

  return (
    <CardContainer 
      ref={cardRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <CardHeader />
      
      <UserInfoSection>
        <AvatarContainer>
          <LargeAvatar>
            <img src={user.avatar} alt={user.name} />
          </LargeAvatar>
        </AvatarContainer>
        
        <UserName>{user.name}</UserName>
        <UserStatus $isOnline={isOnline}>{getStatusText(user.status)}</UserStatus>
        
        {user.bio && <UserBio>{user.bio}</UserBio>}
        
        <UserDetails>
          {user.email && (
            <DetailItem>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {user.email}
            </DetailItem>
          )}
          
          {user.location && (
            <DetailItem>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {user.location}
            </DetailItem>
          )}
          
          {user.joinDate && (
            <DetailItem>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              加入于 {formatDate(user.joinDate)}
            </DetailItem>
          )}
        </UserDetails>
        
        <Divider />
        
        <ActionButtons>
          {onSendMessage && (
            <ActionButton onClick={() => onSendMessage(user.id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              发送消息
            </ActionButton>
          )}
          
          {onViewProfile && (
            <ActionButton onClick={() => onViewProfile(user.id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              查看资料
            </ActionButton>
          )}
        </ActionButtons>
      </UserInfoSection>
    </CardContainer>
  );
};

export default UserInfoCard;
