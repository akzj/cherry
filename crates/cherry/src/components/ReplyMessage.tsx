import React from 'react';
import styled from 'styled-components';

interface ReplyMessageProps {
  message: {
    id: number;
    userId: string;
    content: string;
    type: string;
  };
  onCancel?: () => void;
}

const ReplyContainer = styled.div`
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid #6366f1;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  position: relative;
`;

const ReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const ReplyLabel = styled.span`
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 0.75rem;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
  }
`;

const ReplyContent = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const ReplyMessage: React.FC<ReplyMessageProps> = ({ message, onCancel }) => {
  return (
    <ReplyContainer>
      <ReplyHeader>
        <ReplyLabel>回复消息</ReplyLabel>
        {onCancel && (
          <CancelButton onClick={onCancel}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CancelButton>
        )}
      </ReplyHeader>
      <ReplyContent>
        {message.content.length > 50 
          ? `${message.content.substring(0, 50)}...` 
          : message.content
        }
      </ReplyContent>
    </ReplyContainer>
  );
};

export default ReplyMessage; 