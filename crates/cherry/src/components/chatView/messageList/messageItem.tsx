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
import { userService } from '@/services/userService';
import SafeQuillContent from './SafeQuillContent';
import { Avatar } from '@/components/UI';



export interface MessageItemProps {
  message: Message;
  groupId?: string;
  currentUserId: string;
  onReply: (message: Message) => void;
  onReactionClick: (message: Message, emoji: string) => void;
  onScrollToMessage: (data_message_id: string) => void;
  onCopyMessage?: (message: Message) => void;
}


const MessageItem = React.memo<MessageItemProps>(({ message, currentUserId, groupId, onReply, onReactionClick, onScrollToMessage, onCopyMessage }) => {
  const isOwn = message.user_id === currentUserId;
  const parsedContent = parseMessageContent(message.content, message.type_);
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [username, setUsername] = React.useState<string>('');
  const [userAvatar, setUserAvatar] = React.useState<string>('');

  React.useEffect(() => {
    let isMounted = true;
    userService.getUserName(message.user_id, groupId).then(name => {
      if (isMounted) setUsername(name);
    });


    userService.getUserInfo(message.user_id).then(user => {
      if (isMounted && user) {
        setUserAvatar(user.avatar_url || user.avatar || '');
      }
    });


    return () => { isMounted = false; };
  }, [message.user_id, groupId]);

  return (
    <MessageContainer $isOwn={isOwn} data-message-id={message.conversation_id + message.id} className="message-container">
      <MessageBubble $isOwn={isOwn} $isReply={message.isReply}>
        <QuickEmojiReply isOwn={isOwn}
          onReply={emoji => onReactionClick(message, emoji)}
          onReplyMessage={() => onReply(message)}
          onCopyMessage={() => onCopyMessage && onCopyMessage(message)}
        />

        {/* 回复连接线 */}
        {message.isReply && <ReplyConnection $isOwn={isOwn} />}

        <MessageHeader>
          <Timestamp>{formatTime(message.timestamp)}</Timestamp>
          <Username>{username}</Username>
          {!!isOwn && (<Avatar src={userAvatar} alt='' />)}
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
              <AsyncMessageImage
                url={parsedContent.imageUrl!}
                width={parsedContent.imageWidth}
                height={parsedContent.imageHeight}
              />
              {parsedContent.text && <ImageText>{parsedContent.text}</ImageText>}
            </ImageContainer>
          ) : parsedContent.type === 'quill' && parsedContent.html ? (
            <SafeQuillContent html={parsedContent.html} />
          ) : (
            parsedContent.text
          )}
        </MessageContent>

        {/* reaction bar */}
        {message.reactions && message.reactions.length > 0 && (
          <ReactionBar>
            {message.reactions.map(r => {
              return (
                <ReactionIcon
                  key={r.emoji + r.users.length}
                  onClick={() => onReactionClick(message, r.emoji)}
                  title={r.emoji}
                  $active={r.users.includes(currentUserId)}
                >
                  {r.emoji} {r.users.length > 1 ? r.users.length : ''}
                </ReactionIcon>
              )
            })}
          </ReactionBar>
        )}

      </MessageBubble>
    </MessageContainer>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有真正变化的部分才重新渲染
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.message.type_ === nextProps.message.type_ &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.groupId === nextProps.groupId &&
    JSON.stringify(prevProps.message.reactions) === JSON.stringify(nextProps.message.reactions)
  );
});

export default MessageItem;
