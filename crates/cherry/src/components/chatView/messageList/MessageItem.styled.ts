import styled from 'styled-components';
export const MessageContainer = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  align-items: flex-start;
  gap: 0.5rem;
  max-width: 100%;
  margin: 10px 0;
  width: 100%;
`;

export const MessageBubble = styled.div<{ $isOwn: boolean; $isReply?: boolean }>`
  color: ${props => props.$isOwn ? 'rgba(0, 0, 0, 0.71)' : 'rgba(15, 6, 6, 0.72)'};
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border-bottom-right-radius: ${props => props.$isOwn ? '0.25rem' : '1rem'};
  border-bottom-left-radius: ${props => props.$isOwn ? '1rem' : '0.25rem'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  max-width: 100%;
  flex-shrink: 0;
  ${props => props.$isReply && `margin-top: 0.25rem;`}
`;

export const MessageHeader = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  margin-bottom: 0.25rem;
  gap: 0.75rem; 
  font-size: 0.75rem;
  opacity: 0.7;
`;

export const Username = styled.span`
  font-weight: 600;
  color: #6366f1;
`;

export const Timestamp = styled.span`
  font-size: 0.625rem;
  opacity: 0.6;
`;

export const MessageContent = styled.div`
  line-height: 1.4;
  white-space: pre-wrap;
`;

export const ReplyQuote = styled.div<{ $isOwn: boolean }>`
  background: ${props => props.$isOwn
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.05)'
  };
  border-left: 3px solid #6366f1;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${props => props.$isOwn
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.08)'
  };
    transform: translateX(2px);
  }
`;

export const ReplyQuoteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

export const ReplyQuoteAuthor = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const ReplyQuoteIcon = styled.div`
  width: 12px;
  height: 12px;
  color: #6366f1;
  opacity: 0.7;
`;

export const ReplyQuoteContent = styled.div`
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 2.6em;
  .image-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
  }
  .image-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #6b7280;
    flex-shrink: 0;
  }
`;

export const ReplyConnection = styled.div<{ $isOwn: boolean }>`
  position: absolute;
  left: ${props => props.$isOwn ? 'auto' : '-8px'};
  right: ${props => props.$isOwn ? '-8px' : 'auto'};
  top: -12px;
  width: 16px;
  height: 16px;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border: 2px solid #6366f1;
    border-radius: 50%;
    background: white;
  }
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    ${props => props.$isOwn ? 'right: 8px;' : 'left: 8px;'}
    transform: translateY(-50%);
    width: 8px;
    height: 2px;
    background: #6366f1;
    border-radius: 1px;
  }
`;

export const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

export const ImageText = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
  color: inherit;
  margin-top: 0.5rem;
`;

export const ReactionBar = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
  margin-bottom: 2px;
`;

export const ReactionIcon = styled.button<{ active?: boolean }>`
  border-radius: 12px;
  font-size: 1.05rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  opacity: ${({ active }) => (active ? 1 : 0.8)};
  transition: all 0.15s;
  &:hover {
    transform: translate3d(1px, 1px, 3px) rotate3d(1, 3, 10, 15deg);
    opacity: 1;
  }
`;
