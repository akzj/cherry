// src/components/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ReplyMessage from './ReplyMessage';
import EmojiPicker from './EmojiPicker';
import { useMessageStore } from '../store/message';

interface MessageInputProps {
  onSend: (message: string, replyTo?: number) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  conversationId: string;
}

// ==================== Styled Components ====================
const Container = styled.div`
  position: relative;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Form = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  position: relative;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
    color: #6366f1;
  }
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.75rem;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: rgba(134, 239, 172, 0.5);
    box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.1);
  }
`;

const InputField = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  line-height: 1.4;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmojiButton = styled(IconButton)`
  position: relative;
  margin-left: 0.5rem;
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  background: ${props => props.$disabled 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  };
  border: 1px solid ${props => props.$disabled 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'transparent'
  };
  border-radius: 12px;
  padding: 0.75rem;
  color: ${props => props.$disabled ? 'rgba(255, 255, 255, 0.5)' : 'white'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// ==================== Component Implementation ====================
const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading = false, disabled = false, conversationId }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const { replyingTo, setReplyingTo } = useMessageStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending && !disabled) {
      setIsSending(true);
      try {
        const replyTo = replyingTo?.id;
        await onSend(message, replyTo);
        setMessage('');
        setReplyingTo(null); // 清除回复状态
        // 重置文本框高度
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
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

  const handleEmojiSelect = (emoji: any) => {
    const emojiText = emoji.native || emoji.colons || emoji.unified;
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBefore = message.substring(0, cursorPosition);
    const textAfter = message.substring(cursorPosition);
    
    const newMessage = textBefore + emojiText + textAfter;
    setMessage(newMessage);
    
    // 设置光标位置到表情后面
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = cursorPosition + emojiText.length;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
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
            ref={textareaRef}
            placeholder={replyingTo ? `回复 ${replyingTo.userId}...` : (isSending ? "Sending..." : "Type a message...")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isDisabled}
            rows={1}
          />
          <EmojiButton 
            type="button" 
            disabled={isDisabled}
            onClick={toggleEmojiPicker}
            className={isEmojiPickerOpen ? 'active' : ''}
          >
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

      {/* 表情选择器 */}
      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onEmojiSelect={handleEmojiSelect}
        onClose={() => setIsEmojiPickerOpen(false)}
      />
    </Container>
  );
};

export default MessageInput;
