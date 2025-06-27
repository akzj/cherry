// src/components/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ReplyMessage from './ReplyMessage';
import EmojiPicker from './EmojiPicker';
import ImageUploader from './ImageUploader';
import { useMessageStore } from '../store/message';

interface MessageInputProps {
  onSend: (message: string, replyTo?: number) => Promise<void>;
  onImageSend?: (imageUrl: string, thumbnailUrl: string, metadata: any) => Promise<void>;
  conversationId: string;
  isLoading?: boolean;
  disabled?: boolean;
}

// ==================== Styled Components ====================
const Container = styled.div`
  position: relative;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
`;

const LeftButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  
  &:hover:not(:disabled) {
    background: rgba(107, 114, 128, 0.1);
    color: #374151;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  min-height: 48px;
  
  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: #ffffff;
  }
`;

const InputField = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #111827;
  font-size: 0.95rem;
  line-height: 1.4;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RightButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  
  &:hover:not(:disabled) {
    background: rgba(107, 114, 128, 0.1);
    color: #374151;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SendButton = styled.button<{ $disabled: boolean; $hasContent: boolean }>`
  background: ${props => props.$hasContent 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
    : 'none'
  };
  border: none;
  color: ${props => props.$hasContent ? '#ffffff' : '#6b7280'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-left: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: ${props => props.$hasContent ? 'scale(1.05)' : 'none'};
    background: ${props => props.$hasContent 
      ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' 
      : 'rgba(107, 114, 128, 0.1)'
    };
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// ==================== Component Implementation ====================
const MessageInput: React.FC<MessageInputProps> = ({ 
  onSend, 
  onImageSend,
  conversationId,
  isLoading = false, 
  disabled = false 
}) => {
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
        setReplyingTo(null);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleImageUploadComplete = async (imageUrl: string, thumbnailUrl: string, metadata: any) => {
    if (onImageSend) {
      try {
        await onImageSend(imageUrl, thumbnailUrl, metadata);
      } catch (error) {
        console.error('Failed to send image:', error);
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

  const isInputDisabled = disabled || isLoading || isSending;
  const hasContent = message.trim().length > 0;

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
        {/* 左侧附件按钮 */}
        <LeftButton type="button" disabled={isInputDisabled}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
          </svg>
        </LeftButton>

        {/* 输入区域 */}
        <InputContainer>
          <InputField
            ref={textareaRef}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isInputDisabled}
            rows={1}
          />
          
          <RightButtons>
            {/* 表情按钮 */}
            <ActionButton 
              type="button" 
              disabled={isInputDisabled}
              onClick={toggleEmojiPicker}
              className={isEmojiPickerOpen ? 'active' : ''}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                <circle cx="15.5" cy="9.5" r="1.5"/>
                <circle cx="8.5" cy="9.5" r="1.5"/>
                <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
            </ActionButton>

            {/* 图片上传按钮 */}
            <ImageUploader
              onImageSelect={() => {}}
              onUploadComplete={handleImageUploadComplete}
              conversationId={conversationId}
              disabled={isInputDisabled}
            />

            {/* 语音按钮 */}
            <ActionButton type="button" disabled={isInputDisabled}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </ActionButton>

            {/* 添加按钮 */}
            <ActionButton type="button" disabled={isInputDisabled}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </ActionButton>
          </RightButtons>
        </InputContainer>

        {/* 发送按钮 */}
        <SendButton
          type="submit"
          $disabled={isInputDisabled || !hasContent}
          $hasContent={hasContent}
          disabled={isInputDisabled || !hasContent}
        >
          {isSending ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
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
