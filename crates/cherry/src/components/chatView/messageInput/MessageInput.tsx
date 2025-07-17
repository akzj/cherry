import React, { useState, useRef, useEffect } from 'react';
import ReplyMessage from './ReplyMessage';
import EmojiPicker from './EmojiPicker';
import ImageUploader from './ImageUploader';
import { ImageContent, Message, MessageContentType, QuillContent } from '@/types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill样式
import 'react-quill/dist/quill.bubble.css'; // Quill气泡样式
import editIcon from '@/assets/edit.svg';
import { messageService } from '@/services/messageService';
import { fileService } from '@/services/fileService';
import {
  Container,
  Form,
  InputContainer,
  InputRow,
  InputField,
  ImageThumbnailContainer,
  ImageThumbnail,
  ImageInfo,
  ImageName,
  ImageSize,
  RemoveImageButton,
  RightButtons,
  ActionButton,
  SendButton
} from './MessageInput.styled';

interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  onSendMessage?: () => void;
}

interface SelectedImageInfo {
  path: string;
  name: string;
  size: number;
  preview?: string;
}


// ==================== Component Implementation ====================
const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  disabled = false,
  replyingTo,
  setReplyingTo,
  onSendMessage
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

  // 为 Quill 编辑器添加粘贴事件监听和快捷键监听
  useEffect(() => {
    if (isQuillMode) {
      const quillContainer = document.querySelector('.ql-editor');
      if (quillContainer) {
        const handleQuillKeyDown = (e: Event) => {
          const keyboardEvent = e as KeyboardEvent;
          // Ctrl+Enter 快捷键发送消息
          if (keyboardEvent.ctrlKey && keyboardEvent.key === 'Enter') {
            keyboardEvent.preventDefault();
            handleSubmit(keyboardEvent as any);
          }
        };

        quillContainer.addEventListener('paste', handleQuillPaste);
        quillContainer.addEventListener('keydown', handleQuillKeyDown);
        return () => {
          quillContainer.removeEventListener('paste', handleQuillPaste);
          quillContainer.removeEventListener('keydown', handleQuillKeyDown);
        };
      }
    }
  }, [isQuillMode]);

  // 组件卸载时清理 blob URL
  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.path.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImage.path);
      }
    };
  }, [selectedImage]);

  // 为 Quill 编辑器处理粘贴事件
  const handleQuillPaste = (e: any) => {
    const clipboardData = e.clipboardData || (window as any).clipboardData;
    const items = clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 检查是否是图片
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          try {
            // 创建临时的 blob URL
            const blobUrl = URL.createObjectURL(file);
            
            // 获取图片信息
            const img = new Image();
            img.onload = async () => {
              const fileInfo = {
                name: file.name || `pasted-image-${Date.now()}.png`,
                size: file.size,
                type: file.type,
                width: img.width,
                height: img.height
              };
              
              // 设置选中的图片信息，使用 blob URL 作为路径
              setSelectedImage({
                path: blobUrl,
                name: fileInfo.name,
                size: fileInfo.size,
                preview: blobUrl
              });
            };
            
            img.onerror = () => {
              console.error('无法加载粘贴的图片');
              URL.revokeObjectURL(blobUrl);
            };
            
            img.src = blobUrl;
          } catch (error) {
            console.error('处理粘贴图片失败:', error);
          }
        }
        break;
      }
    }
  };
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 检查是否是图片
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          try {
            // 创建临时的 blob URL
            const blobUrl = URL.createObjectURL(file);
            
            // 获取图片信息
            const img = new Image();
            img.onload = async () => {
              const fileInfo = {
                name: file.name || `pasted-image-${Date.now()}.png`,
                size: file.size,
                type: file.type,
                width: img.width,
                height: img.height
              };
              
              // 设置选中的图片信息，使用 blob URL 作为路径
              setSelectedImage({
                path: blobUrl,
                name: fileInfo.name,
                size: fileInfo.size,
                preview: blobUrl
              });
              
              // 注意：不要立即清理 URL 对象，因为后续上传时还需要使用
              // URL.revokeObjectURL(blobUrl);
            };
            
            img.onerror = () => {
              console.error('无法加载粘贴的图片');
              URL.revokeObjectURL(blobUrl);
            };
            
            img.src = blobUrl;
          } catch (error) {
            console.error('处理粘贴图片失败:', error);
          }
        }
        break;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 快捷键发送消息
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(quillValue);
    e.preventDefault();
    if ((message.trim() || selectedImage || !quillIsEmpty) && !isSending && !disabled) {
      setIsSending(true);
      try {
        let finalMessage = message;
        let messageType: MessageContentType = 'text';

        if (selectedImage) {
          try {
            const response = await fileService.uploadFile(conversationId, selectedImage.path);
            console.log('图片上传成功:', response);
            
            // 如果是 blob URL，清理它
            if (selectedImage.path.startsWith('blob:')) {
              URL.revokeObjectURL(selectedImage.path);
            }
            
            // 创建包含图片和文字的组合消息
            const imageContent: ImageContent = {
              url: response.url,
              thumbnail_url: response.image_metadata?.thumbnail_url,
              metadata: response.image_metadata,
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
            await messageService.sendMessage(conversationId, message, messageType, replyingTo?.id);
            if (onSendMessage) {
              onSendMessage();
            }
          }
          setMessage('');
          return;
        }

        if (finalMessage.trim()) {
          await messageService.sendMessage(conversationId, finalMessage, messageType, replyingTo?.id);
          if (onSendMessage) {
            onSendMessage();
          }
          // 发送成功后清空输入框
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
    console.log('选中的图片路径:', filePath);
    try {
      // 获取文件信息
      const fileInfo = await fileService.getFileInfo(filePath);

      console.log('获取到的文件信息:', fileInfo);

      // 创建预览URL，兼容本地路径和blob URL
      let previewUrl = filePath;
      if (!filePath.startsWith('blob:') && !filePath.startsWith('http')) {
        previewUrl = `file://${filePath}`;
      }
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
    if (selectedImage && selectedImage.path.startsWith('blob:')) {
      // 清理 blob URL 以释放内存
      URL.revokeObjectURL(selectedImage.path);
    }
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
    <Container onPaste={handlePaste}>
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
            placeholder={selectedImage ? "Type a message... (Ctrl+Enter to send)" : "Type a message... (Ctrl+Enter to send)"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
            rows={1}
            style={{ display: isQuillMode ? 'none' : undefined }}
          />

          {/* Quill 编辑器占位符 */}
          {isQuillMode && (
            <div >
              <ReactQuill
                //theme="snow"
                value={quillValue}
                onChange={setQuillValue}
              //  style={{ background: '#fff', color: '#222' }}
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
