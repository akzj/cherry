import React, { useState } from 'react';
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
import CachedAvatar from '@/components/UI/CachedAvatar';
import UserInfoCard from '@/components/UI/UserInfoCard';
import FileMessage from './FileMessage';



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

  const [username, setUsername] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [userCardPosition, setUserCardPosition] = useState({ top: 0, left: 0 });
  const [userInfo, setUserInfo] = useState<{
    id: string;
    name: string;
    avatar: string;
    email?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  }>({ id: '', name: '', avatar: '' });

  React.useEffect(() => {
    let isMounted = true;
    userService.getUserName(message.user_id, groupId).then(name => {
      if (isMounted) setUsername(name);
    });

    userService.getUserInfo(message.user_id).then(user => {
      if (isMounted && user) {
        setUserAvatar(user.avatar_url || user.avatar || '');
        
        // Update userInfo state with available user data
        setUserInfo({
          id: message.user_id,
          name: user.name || username || message.user_id,
          avatar: user.avatar_url || user.avatar || '',
          email: user.email,
          status: user.status as any || 'offline'
        });
      }
    });

    return () => { isMounted = false; };
  }, [message.user_id, groupId, username]);

  // Handle avatar click to show user info card
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log(`Avatar clicked for user: ${message.user_id}`);
    // Prevent event from bubbling up to parent elements
    event.stopPropagation();
    event.preventDefault();
    
    // Get position for the user info card
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Position the card relative to the avatar
    // If it's the user's own message (right side), position to the left of avatar
    // Otherwise (left side messages), position to the right of avatar
    const windowWidth = window.innerWidth;
    
    // Adjust position to keep card visible within viewport
    let leftPos;
    if (isOwn) {
      // For own messages (right side), position to left of avatar
      leftPos = rect.left - 300;
      // Ensure it's not off-screen to the left
      leftPos = Math.max(10, leftPos);
    } else {
      // For others' messages (left side), position to right of avatar
      leftPos = rect.right + 10;
      // Ensure it's not off-screen to the right
      if (leftPos + 280 > windowWidth) {
        leftPos = rect.left - 290; // Place on left side instead
      }
    }
    
    // Get vertical position, ensuring the card isn't placed too high or low
    const windowHeight = window.innerHeight;
    let topPos = rect.top;
    
    // If card would be too low, place it higher
    if (topPos + 350 > windowHeight) {
      topPos = Math.max(10, windowHeight - 350);
    }
    
    console.log('Setting card position:', { top: topPos, left: leftPos });
    
    setUserCardPosition({
      top: topPos,
      left: leftPos
    });
    
    // Show the card
    setShowUserCard(true);
  };

  // Handle closing the user info card
  const handleCloseUserCard = () => {
    setShowUserCard(false);
  };

  // Handle sending a direct message to the user
  const handleSendMessage = (userId: string) => {
    console.log(`Send message to user: ${userId}`);
    // Implementation depends on your app's messaging functionality
    handleCloseUserCard();
  };

  // Handle viewing the user's profile
  const handleViewProfile = (userId: string) => {
    console.log(`View profile of user: ${userId}`);
    // Implementation depends on your app's profile viewing functionality
    handleCloseUserCard();
  };

  return (
    <MessageContainer 
      $isOwn={isOwn} 
      data-message-id={message.conversation_id + message.id} 
      className="message-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <MessageBubble $isOwn={isOwn} $isReply={message.isReply}>
        {/* 只在悬停时渲染 QuickEmojiReply */}
        {isHovered && (
          <QuickEmojiReply 
            isOwn={isOwn}
            onReply={emoji => onReactionClick(message, emoji)}
            onReplyMessage={() => onReply(message)}
            onCopyMessage={() => onCopyMessage && onCopyMessage(message)}
          />
        )}

        {/* 回复连接线 */}
        {message.isReply && <ReplyConnection $isOwn={isOwn} />}

        <MessageHeader>
          <Timestamp>{formatTime(message.timestamp)}</Timestamp>
          <Username>{username}</Username>
          {/* 显示用户头像，并添加点击事件显示用户卡片 */}
          {userAvatar && (
            <div 
              onClick={handleAvatarClick} 
              style={{ 
                cursor: 'pointer',
                position: 'relative',
                zIndex: 50
              }}
              title={`查看 ${username || 'User'} 的信息`}
            >
              <CachedAvatar 
                src={userAvatar} 
                alt={username || 'User'} 
                size="sm"
                lazy={true}
              />
            </div>
          )}
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
                } else if (replyContent.type === 'file') {
                  return (
                    <div className="file-preview">
                      <div className="file-icon">📎</div>
                      <span>{replyContent.filename || '文件'}</span>
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
          ) : parsedContent.type === 'file' ? (
            <FileMessage
              fileUrl={parsedContent.fileUrl!}
              filename={parsedContent.filename!}
              fileSize={parsedContent.fileSize!}
              mimeType={parsedContent.mimeType}
            />
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
      
      {/* User info card popup - rendered at document root for better positioning */}
      {showUserCard && (
        <React.Fragment>
          {/* Overlay to capture clicks outside the card */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1400
            }}
            onClick={handleCloseUserCard}
          />
          <UserInfoCard
            user={userInfo}
            position={userCardPosition}
            onClose={handleCloseUserCard}
            onSendMessage={handleSendMessage}
            onViewProfile={handleViewProfile}
          />
        </React.Fragment>
      )}
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
    JSON.stringify(prevProps.message.reactions) === JSON.stringify(nextProps.message.reactions) &&
    prevProps.message.isReply === nextProps.message.isReply &&
    (prevProps.message.replyToMessage?.id === nextProps.message.replyToMessage?.id)
  );
});

export default MessageItem;
