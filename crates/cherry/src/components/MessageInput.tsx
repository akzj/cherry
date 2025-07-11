// src/components/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { invoke } from '@tauri-apps/api/core';
import ReplyMessage from './ReplyMessage';
import EmojiPicker from './EmojiPicker';
import ImageUploader from './ImageUploader';
import { ImageContent, Message, QuillContent } from '@/types';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import editIcon from '../assets/edit.svg';
import { sendMessage } from '@/api';

interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
}

interface FileUploadCompleteResponse {
  file_id: string;
  file_name: string;
  file_url: string;
  file_thumbnail_url: string;
  file_metadata: any;
}

interface SelectedImageInfo {
  path: string;
  name: string;
  size: number;
  preview?: string;
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
  align-items: flex-end;
  gap: 0.75rem;
  position: relative;
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
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

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
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
  min-height: 25px;
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

const ImageThumbnailContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const ImageThumbnail = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ImageInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ImageName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const ImageSize = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

const RemoveImageButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
  
  svg {
    width: 14px;
    height: 14px;
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
  conversationId,
  disabled = false,
  replyingTo,
  setReplyingTo,
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImageInfo | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isQuillMode, setIsQuillMode] = useState(false);
  const [quillValue, setQuillValue] = useState('');

  const quillIsEmpty = quillValue.trim() == "<p><br></p>" || quillValue.trim() == "";

  const changeQuillMode = () => {
    setIsQuillMode(!isQuillMode);
  };

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(quillValue);
    e.preventDefault();
    if ((message.trim() || selectedImage || !quillIsEmpty) && !isSending && !disabled) {
      setIsSending(true);
      try {
        let finalMessage = message;
        let messageType = 'text';

        if (selectedImage) {
          try {
            const response = await invoke<FileUploadCompleteResponse>('cmd_upload_file', {
              conversationId: conversationId,
              filePath: selectedImage.path,
            });

            // 创建包含图片和文字的组合消息
            const imageContent: ImageContent = {
              url: response.file_url,
              thumbnail_url: response.file_thumbnail_url,
              metadata: response.file_metadata,
              text: message.trim() || undefined
            };

            // 发送图片消息，文字作为图片的附加文本
            finalMessage = JSON.stringify(imageContent);
            messageType = 'image';
            setSelectedImage(null);
          } catch (uploadError) {
            console.error('图片上传失败:', uploadError);
          }
        }

        if (!quillIsEmpty) {
          const quillContent: QuillContent = {
            type: 'quill',
            html: quillValue,
            delta: quillValue
          };
          finalMessage = JSON.stringify(quillContent);
          messageType = 'quill';
          setQuillValue('');
        }
        // 方便测试发送大小消息
        if (messageType == 'text') {
          const messages = finalMessage.split("\n");
          for (const message of messages) {
            await sendMessage(conversationId, message, messageType, replyingTo?.id);
          }
          return;
        }

        if (finalMessage.trim()) {
          await sendMessage(conversationId, finalMessage, messageType, replyingTo?.id);
          setMessage('');
        }
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

  // 选图片时获取图片信息
  const handleImageSelect = async (filePath: string) => {
    try {
      // 获取文件信息
      const fileInfo = await invoke<{ name: string; size: number }>('cmd_get_file_info', {
        filePath: filePath
      });

      // 创建预览URL
      const previewUrl = `file://${filePath}`;

      setSelectedImage({
        path: filePath,
        name: fileInfo.name,
        size: fileInfo.size,
        preview: previewUrl
      });
    } catch (error) {
      console.error('获取文件信息失败:', error);
      // 如果获取信息失败，仍然设置基本路径
      setSelectedImage({
        path: filePath,
        name: filePath.split('/').pop() || 'image',
        size: 0,
        preview: `file://${filePath}`
      });
    }
  };

  // 移除图片
  const handleRemoveImage = () => {
    setSelectedImage(null);
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

  const isInputDisabled = disabled || isSending;
  const hasContent = message.trim().length > 0 || selectedImage || !quillIsEmpty;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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
        {/* 输入区域 */}
        <InputContainer>
          {/* 图片缩略图显示 */}
          {selectedImage && (
            <ImageThumbnailContainer>
              <ImageThumbnail
                src={selectedImage.preview}
                alt={selectedImage.name}
                onError={(e) => {
                  // 如果file://协议失败，尝试使用后端serve
                  const target = e.target as HTMLImageElement;
                  target.src = `cherry://localhost?file_path=${selectedImage.path}`;
                }}
              />
              <ImageInfo>
                <ImageName>{selectedImage.name}</ImageName>
                <ImageSize>{formatFileSize(selectedImage.size)}</ImageSize>
              </ImageInfo>
              <RemoveImageButton onClick={handleRemoveImage} title="移除图片">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </RemoveImageButton>
            </ImageThumbnailContainer>
          )}

          <InputField
            ref={textareaRef}
            placeholder={selectedImage ? "Type a message..." : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isInputDisabled}
            rows={1}
            style={{ display: isQuillMode ? 'none' : undefined }}
          />

          {/* Quill 编辑器占位符 */}
          {isQuillMode && (
            <div >
              <ReactQuill
                theme="snow"
                value={quillValue}
                onChange={setQuillValue}
                style={{ background: '#fff', color: '#222' }}
              />
            </div>
          )}
          <InputRow>
            <RightButtons>
              <ActionButton type="button" disabled={isInputDisabled} >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                </svg>
              </ActionButton>

              {/* 表情按钮 */}
              <ActionButton
                type="button"
                disabled={isInputDisabled}
                onClick={toggleEmojiPicker}
                className={isEmojiPickerOpen ? 'active' : ''}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  <circle cx="15.5" cy="9.5" r="1.5" />
                  <circle cx="8.5" cy="9.5" r="1.5" />
                  <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </ActionButton>

              {/* 图片上传按钮 */}
              <ImageUploader
                onImageSelect={handleImageSelect}
                disabled={isInputDisabled || !!selectedImage}
              />

              {/* 语音按钮 */}
              <ActionButton type="button" disabled={isInputDisabled}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </ActionButton>

              {/* quill按钮 */}
              <ActionButton type="button" disabled={isInputDisabled} onClick={changeQuillMode}>
                {/* edit.svg icon */}
                <img src={editIcon} alt="edit" width={24} height={24} />
              </ActionButton>
            </RightButtons>
          </InputRow>
        </InputContainer>

        {/* 发送按钮 */}
        <SendButton
          type="submit"
          $disabled={isInputDisabled || !hasContent}
          $hasContent={!!hasContent}
          disabled={isInputDisabled || !hasContent}
        >
          {isSending ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22,2 15,22 11,13 2,9 22,2" />
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
