import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import ContactItem from './ContactItem';
import type { ContactGroup, Contact } from '@/types';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ContactGroupProps {
  group: ContactGroup;
  onContactClick?: (contact: Contact) => void;
}

// ==================== Styled Components ====================
const GroupContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 
      0 6px 25px rgba(0, 0, 0, 0.15),
      0 3px 15px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  transition: transform 0.3s ease;
  color: rgba(23, 150, 104, 0.49);
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const GroupTitle = styled.h3`
  font-weight: 600;
  color: rgba(92, 41, 179, 0.43);
  margin: 0;
  flex-grow: 1;
  font-size: 1rem;
`;

const ContactCount = styled.span`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  padding: 0.375rem 0.75rem;
  margin-left: 0.5rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
`;

const ContactListContainer = styled.div<{ $expanded: boolean }>`
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  ${({ $expanded }) => !$expanded && css`
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
    margin-top: 0;
  `}
  
  ${({ $expanded }) => $expanded && css`
    max-height: 1000px;
    opacity: 1;
    transform: translateY(0);
  `}
`;

// ==================== Component Implementation ====================
const ContactGroup: React.FC<ContactGroupProps> = ({ group, onContactClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <GroupContainer>
      <GroupHeader onClick={toggleExpand}>
        <IconContainer>
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </IconContainer>

        <GroupTitle>{group.title}</GroupTitle>

        <ContactCount>
          {group.contacts.length} 位联系人
        </ContactCount>
      </GroupHeader>

      <ContactListContainer $expanded={isExpanded}>
        {group.contacts.map(contact => (
          <ContactItem
            key={contact.contact_id}
            contact={contact}
            onClick={() => onContactClick && onContactClick(contact)}
          />
        ))}
      </ContactListContainer>
    </GroupContainer>
  );
};

export default ContactGroup;
