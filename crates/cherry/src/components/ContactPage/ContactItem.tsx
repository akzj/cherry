import React from 'react';
import styled from 'styled-components';
import Avatar from '@/components/UI/Avatar';
import { Contact } from '@/types';

interface ContactItemProps {
  contact: Contact;
  onClick: () => void;
}

// ==================== Styled Components ====================
const ContactItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
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

const ContactItem: React.FC<ContactItemProps> = ({ contact, onClick }) => {
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
    </ContactItemContainer>
  );
};

export default ContactItem;
