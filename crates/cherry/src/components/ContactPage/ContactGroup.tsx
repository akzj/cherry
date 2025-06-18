import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import ContactItem from './ContactItem';
import type { ContactGroup } from '../../types/contact';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ContactGroupProps {
  group: ContactGroup;
}

// ==================== Styled Components ====================
const GroupContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #f8fafc;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  transition: transform 0.25s ease;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: #94a3b8;
  }
`;

const GroupTitle = styled.h3`
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex-grow: 1;
  font-size: 1rem;
`;

const ContactCount = styled.span`
  background-color: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  margin-left: 0.5rem;
`;

const ContactListContainer = styled.div<{ $expanded: boolean }>`
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 0.25rem;
  
  ${({ $expanded }) => !$expanded && css`
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
  `}
  
  ${({ $expanded }) => $expanded && css`
    max-height: 1000px;
    opacity: 1;
    transform: translateY(0);
  `}
`;

// ==================== Component Implementation ====================
const ContactGroup: React.FC<ContactGroupProps> = ({ group }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <GroupContainer>
      <GroupHeader onClick={toggleExpand}>
        <IconContainer>
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </IconContainer>

        <GroupTitle>{group.name}</GroupTitle>

        <ContactCount>
          {group.contacts.length} 位联系人
        </ContactCount>
      </GroupHeader>

      <ContactListContainer $expanded={isExpanded}>
        {group.contacts.map(contact => (
          <ContactItem
            key={contact.id}
            contact={contact}
            onClick={() => console.log('Contact clicked', contact.id)}
          />
        ))}
      </ContactListContainer>
    </GroupContainer>
  );
};

export default ContactGroup;
