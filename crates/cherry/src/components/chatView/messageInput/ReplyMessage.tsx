import React from 'react';
import { ReplyContainer, ReplyHeader, ReplyLabel, CancelButton, ReplyContent } from './ReplyMessage.styled';
import { Message, parseMessageContent } from '@/types';

interface ReplyMessageProps {
  message: Message;
  onCancel?: () => void;
}


const ReplyMessage: React.FC<ReplyMessageProps> = ({ message, onCancel }) => {
  const parsedContent = parseMessageContent(message.content, message.type_);
  
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
        {parsedContent.type === 'image' ? (
          <div className="image-preview">
            <div className="image-icon">📷</div>
            <span>{parsedContent.text || '图片'}</span>
          </div>
        ) : parsedContent.type === 'file' ? (
          <div className="file-preview">
            <div className="file-icon">📎</div>
            <span>{parsedContent.filename || '文件'}</span>
          </div>
        ) : (
          parsedContent.text && (parsedContent.text.length > 50 
            ? `${parsedContent.text.substring(0, 50)}...` 
            : parsedContent.text)
        )}
      </ReplyContent>
    </ReplyContainer>
  );
};

export default ReplyMessage; 