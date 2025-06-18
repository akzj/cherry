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
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ContactItem = styled.div`
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border-radius: 10px;
  background: rgba(102, 162, 172, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.1),
      0 2px 10px rgba(0, 0, 0, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  ${ContactItem}:hover & {
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
`;

const ContactInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContactHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0rem;
`;

const ContactName = styled.h3`
  font-weight: 700;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(17, 9, 75, 0.9);
  margin: 0;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: rgba(63, 1, 46, 0.6);
  white-space: nowrap;
  margin-left: 0.5rem;
  font-weight: 500;
`;

const MessagePreviewContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.2rem;
`;

const LastMessage = styled.p<{ $unread: boolean }>`
  font-size: 0.875rem;
  color: ${({ $unread }) => $unread ? 'rgba(159, 120, 120, 0.8)' : 'rgba(84, 158, 122, 0.6)'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${({ $unread }) => $unread ? '600' : '400'};
  margin: 0;
  flex: 1;
`;

const UnreadBadge = styled.span`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-size: 0.75rem;
  border-radius: 12px;
  height: 1.25rem;
  min-width: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.375rem;
  flex-shrink: 0;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  animation: bounce 1s infinite;
  
  @keyframes bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
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
