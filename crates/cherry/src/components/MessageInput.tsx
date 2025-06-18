// src/components/MessageInput.tsx
import React, { useState } from 'react';
import styled from 'styled-components';

interface MessageInputProps {
  onSend: (message: string) => void;
}

// ==================== Styled Components ====================
const Container = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
  
  @media (prefers-color-scheme: dark) {
    border-top-color: #374151;
  }
`;

const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  padding: 0.5rem;
  color: #6b7280;
  transition: color 0.2s;
  border-radius: 50%;
  
  &:hover {
    color: #4b5563;
    
    @media (prefers-color-scheme: dark) {
      color: #d1d5db;
    }
  }
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
    background-color: #fff;
  }
  
  @media (prefers-color-scheme: dark) {
    background-color: #4b5563;
    color: white;
    
    &:focus {
      background-color: #1f2937;
    }
  }
`;

const EmojiButton = styled(IconButton)`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  padding: 0.75rem;
  border-radius: 9999px;
  background-color: #3b82f6;
  color: white;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  
  &:hover {
    background-color: ${({ $disabled }) => $disabled ? '#93c5fd' : '#2563eb'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #93c5fd;
  }
  
  ${({ $disabled }) => $disabled && `
    background-color: #93c5fd;
    cursor: not-allowed;
  `}
`;

// ==================== Component Implementation ====================
const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <IconButton type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </IconButton>

        <InputContainer>
          <InputField
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <EmojiButton type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </EmojiButton>
        </InputContainer>

        <SendButton
          type="submit"
          $disabled={!message.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </SendButton>
      </Form>
    </Container>
  );
};

export default MessageInput;
