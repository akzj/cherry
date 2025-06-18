// src/components/ContactList.tsx
import React from 'react';
import styled from 'styled-components';
import { Conversation } from '../types/types';

interface ContactListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

// ==================== Styled Components ====================
const ContactListContainer = styled.div`
  border-top-width: 1px;
  border-color: rgba(55, 65, 81, 0.5);
`;

const ContactItem = styled.div`
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &:hover {
    background-color: rgba(55, 65, 81, 0.5);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 3rem;
  height: 3rem;
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
  border: 2px solid rgba(31, 41, 55);
`;

const ContactInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContactHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
`;

const ContactName = styled.h3`
  font-weight: 500;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: rgba(156, 163, 175);
  white-space: nowrap;
  margin-left: 0.5rem;
`;

const MessagePreviewContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const LastMessage = styled.p<{ $unread: boolean }>`
  font-size: 0.875rem;
  color: rgba(156, 163, 175);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${({ $unread }) => $unread ? '500' : '400'};
  color: ${({ $unread }) => $unread ? '#d1d5db' : 'rgba(156, 163, 175)'};
`;

const UnreadBadge = styled.span`
  background-color: #3b82f6;
  color: white;
  font-size: 0.75rem;
  border-radius: 9999px;
  height: 1.25rem;
  min-width: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
  flex-shrink: 0;
`;

// ==================== Component Implementation ====================
const ContactList: React.FC<ContactListProps> = ({
  conversations,
  onSelectConversation
}) => {
  return (
    <ContactListContainer>
      {conversations.map(conversation => (
        <ContactItem
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <AvatarContainer>
            <Avatar
              src={conversation.avatar}
              alt={conversation.name}
            />
            {conversation.participants.some(p => p.status === 'online') && (
              <OnlineIndicator />
            )}
          </AvatarContainer>

          <ContactInfo>
            <ContactHeader>
              <ContactName>{conversation.name}</ContactName>
              {conversation.lastMessage && (
                <Timestamp>
                  {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Timestamp>
              )}
            </ContactHeader>

            <MessagePreviewContainer>
              {conversation.lastMessage ? (
                <LastMessage $unread={conversation.unreadCount > 0}>
                  {conversation.lastMessage.content}
                </LastMessage>
              ) : (
                <LastMessage $unread={false}>
                  Start a conversation
                </LastMessage>
              )}

              {conversation.unreadCount > 0 && (
                <UnreadBadge>
                  {conversation.unreadCount}
                </UnreadBadge>
              )}
            </MessagePreviewContainer>
          </ContactInfo>
        </ContactItem>
      ))}
    </ContactListContainer>
  );
};

export default ContactList;
