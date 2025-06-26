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
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-left: 4px solid #6366f1;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    background: url("data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 17h3l2-4V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l2 4z" fill="#6366f1"/>
        <path d="M9 12a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1z" fill="white"/>
      </svg>
    `)}") no-repeat center;
    background-size: contain;
  }
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
  color: rgba(0, 0, 0, 0.75);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 100%;
  font-weight: 500;
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