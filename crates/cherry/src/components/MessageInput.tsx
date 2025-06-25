// src/components/MessageInput.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import ReplyMessage from './ReplyMessage';
import { useMessageStore } from '../store/message';

interface MessageInputProps {
  onSend: (message: string, replyTo?: number) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  conversationId: string;
}

// ==================== Styled Components ====================
const Container = styled.div`
  padding: 1.25rem 1.5rem;
  background: rgba(38, 116, 22, 0.1);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0 0 20px 20px;
`;

const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  padding: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const InputField = styled.input`
  width: 100%;
  padding: 1rem 1.25rem 1rem 3.5rem;
  border-radius: 20px;
  background: rgba(129, 250, 95, 0);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  font-size: 1rem;
  color: rgb(38, 72, 66);
  font-weight: 400;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 
      0 0 0 3px rgba(99, 102, 241, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const EmojiButton = styled(IconButton)`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  border-radius: 12px;
  
  &:hover {
    transform: translateY(-50%) scale(1.1);
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  padding: 1rem 1.25rem;
  border-radius: 20px;
  background: ${({ $disabled }) =>
    $disabled
      ? 'rgba(255, 255, 255, 0.1)'
      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  };
  color: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  box-shadow: ${({ $disabled }) =>
    $disabled
      ? 'none'
      : '0 4px 20px rgba(99, 102, 241, 0.3), 0 2px 10px rgba(139, 92, 246, 0.2)'
  };
  
  &:hover {
    ${({ $disabled }) => !$disabled && `
      transform: translateY(-2px);
      box-shadow: 
        0 6px 25px rgba(99, 102, 241, 0.4),
        0 3px 15px rgba(139, 92, 246, 0.3);
    `}
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${({ $disabled }) => $disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

// ==================== Component Implementation ====================
const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading = false, disabled = false, conversationId }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { replyingTo, setReplyingTo } = useMessageStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending && !disabled) {
      setIsSending(true);
      try {
        const replyTo = replyingTo?.id;
        await onSend(message, replyTo);
        setMessage('');
        setReplyingTo(null); // 清除回复状态
      } catch (error) {
        console.error('Failed to send message:', error);
        // 可以在这里添加错误提示
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const isDisabled = disabled || isLoading || isSending || !message.trim();

  return (
    <Container>
      {/* 显示回复消息 */}
      {replyingTo && (
        <ReplyMessage 
          message={replyingTo} 
          onCancel={handleCancelReply}
        />
      )}
      
      <Form onSubmit={handleSubmit}>
        <IconButton type="button" disabled={isDisabled}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </IconButton>

        <InputContainer>
          <InputField
            type="text"
            placeholder={replyingTo ? `回复 ${replyingTo.userId}...` : (isSending ? "Sending..." : "Type a message...")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isDisabled}
          />
          <EmojiButton type="button" disabled={isDisabled}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </EmojiButton>
        </InputContainer>

        <SendButton
          type="submit"
          $disabled={isDisabled}
        >
          {isSending ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </SendButton>
      </Form>
    </Container>
  );
};

export default MessageInput;
