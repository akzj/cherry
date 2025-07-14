import React from 'react';
import {
  MessageContainer,
  MessageBubble,
  MessageHeader,
  Username,
  Timestamp,
  MessageContent,
  ReplyQuote,
  ReplyQuoteHeader,
  ReplyQuoteAuthor,
  ReplyQuoteIcon,
  ReplyQuoteContent,
  ReplyConnection,
  ImageContainer,
  ImageText,
  ReactionBar,
  ReactionIcon,
} from './MessageItem.styled';
import QuickEmojiReply from '@/components/UI/QuickEmojiReply';
import AsyncMessageImage from './AsyncMessageImage';
import { Message, parseMessageContent } from '@/types';



export interface MessageNodeProps {
    message: Message;
    currentUserId: string;
    onReply: (message: Message) => void;
    onReactionClick: (message: Message, emoji: string) => void;
    onScrollToMessage: (data_message_id: string) => void;
  }
  

const MessageItem = React.memo<MessageNodeProps>(({ message, currentUserId, onReply, onReactionClick, onScrollToMessage }) => {
  const isOwn = message.user_id === currentUserId;
  const parsedContent = parseMessageContent(message.content, message.type_);
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MessageContainer $isOwn={isOwn} data-message-id={message.conversation_id + message.id} className="message-container">
      <MessageBubble $isOwn={isOwn} $isReply={message.isReply}>
        <QuickEmojiReply
          onReply={emoji => onReactionClick(message, emoji)}
          onReplyMessage={() => onReply(message)}
        />

        {/* 回复连接线 */}
        {message.isReply && <ReplyConnection $isOwn={isOwn} />}

        <MessageHeader>
          <Username>{message.id}</Username>
          <Timestamp>{formatTime(message.timestamp)}</Timestamp>
        </MessageHeader>

        {/* 新的回复引用显示 */}
        {message.isReply && message.replyToMessage && (
          <ReplyQuote
            $isOwn={isOwn}
            onClick={() => onScrollToMessage(message.conversation_id + message.replyToMessage!.id)}
          >
            <ReplyQuoteHeader>
              <ReplyQuoteIcon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 17h3l2-4V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l2 4z" />
                  <path d="M9 12a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1z" />
                </svg>
              </ReplyQuoteIcon>
              <ReplyQuoteAuthor>{message.replyToMessage.user_id}</ReplyQuoteAuthor>
            </ReplyQuoteHeader>
            <ReplyQuoteContent>
              {(() => {
                const replyContent = parseMessageContent(message.replyToMessage.content, message.replyToMessage.type_);
                if (replyContent.type === 'image') {
                  return (
                    <div className="image-preview">
                      <div className="image-icon">📷</div>
                      <span>{replyContent.text || '图片'}</span>
                    </div>
                  );
                } else {
                  return replyContent.text || '';
                }
              })()}
            </ReplyQuoteContent>
          </ReplyQuote>
        )}

        <MessageContent>
          {parsedContent.type === 'image' ? (
            <ImageContainer>
              <AsyncMessageImage url={parsedContent.imageUrl!} />
              {parsedContent.text && (
                <ImageText>{parsedContent.text}</ImageText>
              )}
            </ImageContainer>
          ) : parsedContent.type === 'quill' && parsedContent.html ? (
            <div dangerouslySetInnerHTML={{ __html: parsedContent.html }} />
          ) : (
            parsedContent.text
          )}
        </MessageContent>

        {/* reaction bar */}
        {message.reactions && message.reactions.length > 0 && (
          <ReactionBar>
            {message.reactions.map(r => (
              <ReactionIcon
                key={r.emoji + r.users.length}
                active={r.users.includes(currentUserId)}
                onClick={() => onReactionClick(message, r.emoji)}
                title={r.emoji}
              >
                {r.emoji} {r.users.length > 1 ? r.users.length : ''}
              </ReactionIcon>
            ))}
          </ReactionBar>
        )}

      </MessageBubble>
    </MessageContainer>
  );
});

export default MessageItem;
