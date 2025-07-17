import React from 'react';
import styled from 'styled-components';
import Avatar from '@/components/UI/Avatar';
import { Contact } from '@/types';
import { FaComment, FaPhone, FaVideo } from 'react-icons/fa';

interface ContactItemProps {
  contact: Contact;
  onClick: () => void;
  onMessage?: (contact: Contact) => void;
  onVoiceCall?: (contact: Contact) => void;
  onVideoCall?: (contact: Contact) => void;
}

// ==================== Styled Components ====================
const ContactItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:hover .contact-actions {
    opacity: 1;
    transform: translateX(0);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ContactInfo = styled.div`
  margin-left: 1rem;
  flex: 1;
`;

const ContactName = styled.div`
  font-weight: 600;
  color: rgba(11, 18, 86, 0.51);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const ContactStatus = styled.div`
  font-size: 0.75rem;
  color: rgba(38, 91, 0, 0.66);
  text-transform: capitalize;
  font-weight: 500;
`;

const ContactActions = styled.div`
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  margin-left: 0.5rem;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    width: 14px;
    height: 14px;
    color: #6b7280;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &.message-btn:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    
    svg {
      color: #6366f1;
    }
  }
  
  &.phone-btn:hover {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
    
    svg {
      color: #22c55e;
    }
  }
  
  &.video-btn:hover {
    background: rgba(168, 85, 247, 0.1);
    border-color: rgba(168, 85, 247, 0.3);
    
    svg {
      color: #a855f7;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ContactItem: React.FC<ContactItemProps> = ({ 
  contact, 
  onClick, 
  onMessage, 
  onVoiceCall, 
  onVideoCall 
}) => {
  // 将contact.status转换为Avatar组件接受的Status类型
  const getValidStatus = (status: string): 'online' | 'offline' | 'busy' | 'away' => {
    switch (status) {
      case 'online':
      case 'offline':
      case 'busy':
      case 'away':
        return status;
      default:
        return 'online';
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage(contact);
    }
  };

  const handleVoiceCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVoiceCall) {
      onVoiceCall(contact);
    }
  };

  const handleVideoCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVideoCall) {
      onVideoCall(contact);
    }
  };

  return (
    <ContactItemContainer onClick={onClick}>
      <Avatar 
        src={contact.avatar_url || ''} 
        alt={contact.remark_name || ''} 
        status={getValidStatus(contact.status || 'online')} 
        size="md"
      />
      <ContactInfo>
        <ContactName>{contact.remark_name}</ContactName>
        <ContactStatus>{contact.status || ''}</ContactStatus>
      </ContactInfo>
      
      <ContactActions className="contact-actions">
        <ActionButton 
          className="message-btn" 
          onClick={handleMessageClick}
          title="发送消息"
        >
          <FaComment />
        </ActionButton>
        
        <ActionButton 
          className="phone-btn" 
          onClick={handleVoiceCallClick}
          title="语音通话"
        >
          <FaPhone />
        </ActionButton>
        
        <ActionButton 
          className="video-btn" 
          onClick={handleVideoCallClick}
          title="视频通话"
        >
          <FaVideo />
        </ActionButton>
      </ContactActions>
    </ContactItemContainer>
  );
};

export default ContactItem;
