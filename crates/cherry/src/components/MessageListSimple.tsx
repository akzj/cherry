import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Message, parseMessageContent } from '../types/types';
import { appCacheDir } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { path } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/core';
import QuickEmojiReply from './UI/QuickEmojiReply';
import { addReaction, loadMessages, removeReaction } from '../api/api';
import { BidirectionalInfiniteScroll, LoadItemsParams } from './bidirectional-infinite-scroll';
import { DataItem, useBidirectionalData } from '../hooks/use-bidirectional-data';
import { message } from '@tauri-apps/plugin-dialog';

const appCacheDirPath = await appCacheDir();

interface MessageListProps {
  currentUserId: string;
  conversationId: string;
  setReplyingTo: (message: Message | null) => void;
}

// ==================== Styled Components ====================

const MessageContainer = styled.div<{ $isOwn: boolean }>`
  display: flex;
  border: 1px solid green;  
  //justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  align-items: flex-start;
  gap: 0.5rem;
  max-width: 100%;
  margin: 10px 0;
  width: 100%;
`;

const MessageBubble = styled.div<{ $isOwn: boolean; $isReply?: boolean }>`
  background: ${props => props.$isOwn
    ? 'linear-gradient(135deg,rgba(117, 211, 80, 0.15) 0%,rgba(109, 186, 161, 0.59) 100%)'
    : 'linear-gradient(135deg,rgba(90, 186, 83, 0.1) 0%,rgba(255, 255, 255, 0.1) 100%)'
  };
  color: ${props => props.$isOwn ? 'rgba(0, 0, 0, 0.71)' : 'rgba(15, 6, 6, 0.72)'};
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border-bottom-right-radius: ${props => props.$isOwn ? '0.25rem' : '1rem'};
  border-bottom-left-radius: ${props => props.$isOwn ? '1rem' : '0.25rem'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  max-width: 100%;
  flex-shrink: 0;
  
  ${props => props.$isReply && `
    margin-top: 0.25rem;
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
`;

const Username = styled.span`
  font-weight: 600;
  color: #6366f1;
`;

const Timestamp = styled.span`
  font-size: 0.625rem;
  opacity: 0.6;
`;

const MessageContent = styled.div`
  line-height: 1.4;
  white-space: pre-wrap;
`;



// 回复消息的引用显示
const ReplyQuote = styled.div<{ $isOwn: boolean }>`
  background: ${props => props.$isOwn
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.05)'
  };
  border-left: 3px solid #6366f1;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isOwn
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.08)'
  };
    transform: translateX(2px);
  }
`;

const ReplyQuoteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const ReplyQuoteAuthor = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ReplyQuoteIcon = styled.div`
  width: 12px;
  height: 12px;
  color: #6366f1;
  opacity: 0.7;
`;

const ReplyQuoteContent = styled.div`
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 2.6em;
  
  /* 支持图片预览的样式 */
  .image-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
  }
  
  .image-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #6b7280;
    flex-shrink: 0;
  }
`;

// 连接线样式
const ReplyConnection = styled.div<{ $isOwn: boolean }>`
  position: absolute;
  left: ${props => props.$isOwn ? 'auto' : '-8px'};
  right: ${props => props.$isOwn ? '-8px' : 'auto'};
  top: -12px;
  width: 16px;
  height: 16px;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border: 2px solid #6366f1;
    border-radius: 50%;
    background: white;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    ${props => props.$isOwn ? 'right: 8px;' : 'left: 8px;'}
    transform: translateY(-50%);
    width: 8px;
    height: 2px;
    background: #6366f1;
    border-radius: 1px;
  }
`;

// 图片容器
const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const ImageText = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
  color: inherit;
  margin-top: 0.5rem;
`;

const ReactionBar = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
  margin-bottom: 2px;
`;

const ReactionIcon = styled.button<{ active?: boolean }>`
  border-radius: 12px;
  font-size: 1.05rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  opacity: ${({ active }) => (active ? 1 : 0.8)};
  transition: all 0.15s;
  &:hover {
    transform: translate3d(1px, 1px, 3px) rotate3d(1, 3, 10, 15deg);
    opacity: 1;
  }
`;

// ==================== Component Implementation ====================
const MessageItem = React.memo<{
  message: Message;
  currentUserId: string;
  onReply: (message: Message) => void;
  onReactionClick: (message: Message, emoji: string) => void;
  onScrollToMessage: (messageId: number) => void;
}>(({ message, currentUserId, onReply, onReactionClick, onScrollToMessage }) => {
  const isOwn = message.user_id === currentUserId;
  console.log('MessageItem render:', {
    currentUserId: currentUserId,
    messageId: message.id,
    userId: message.user_id,
    isOwn,
    content: message.content,
    timestamp: message.timestamp,
    reactions: message.reactions?.length || 0,
  });
  const parsedContent = parseMessageContent(message.content, message.type_);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 简化的异步图片组件
  const AsyncMessageImage: React.FC<{ url: string }> = ({ url }) => {
    const [src, setSrc] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      const getFile = async (url: string) => {
        const cache_file_path = await path.join(appCacheDirPath, url);
        const cache_file_exists = await exists(cache_file_path);
        if (cache_file_exists) {
          return cache_file_path;
        }
        return await invoke('cmd_download_file', {
          url: url,
          filePath: cache_file_path
        });
      };
      (async () => {
        setIsLoading(true);
        const path = await getFile(url);
        if (mounted) {
          setSrc(path as string);
          setIsLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [url]);

    if (isLoading) {
      return <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>图片加载中...</div>;
    }

    if (!src) return <span>图片加载失败</span>;

    return (
      <img
        src={`cherry://localhost?file_path=${src}`}
        style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', margin: '4px 0' }}
      />
    );
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
          {/* <Username>{message.user_id}</Username> */}
          <Timestamp>{formatTime(message.timestamp)}</Timestamp>
        </MessageHeader>

        {/* 新的回复引用显示 */}
        {message.isReply && message.replyToMessage && (
          <ReplyQuote
            $isOwn={isOwn}
            onClick={() => onScrollToMessage(message.replyToMessage!.id)}
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
}, (prevProps, nextProps) => {
  // 自定义比较函数，只在必要时重新渲染
  const prev = prevProps.message;
  const next = nextProps.message;

  return (
    prev.id === next.id &&
    prev.content === next.content &&
    prev.timestamp === next.timestamp &&
    JSON.stringify(prev.reactions) === JSON.stringify(next.reactions) &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

type MessageExt = DataItem<Message>;

const MessageList: React.FC<MessageListProps> = ({ currentUserId, conversationId, setReplyingTo }) => {

  const loadItems = useCallback(async (params: LoadItemsParams) => {

    let messageId: number = 0;
    let direction: 'forward' | 'backward' = 'backward';
    if (params.forward) {
      messageId = params.forward.key as number;
      direction = 'forward';
    } else if (params.backward) {
      messageId = params.backward.key as number;
      direction = 'backward';
    }

    //await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const messages = await loadMessages(conversationId, messageId, direction, 25);
    if (messages.length === 0) {
      console.info('no more message:', conversationId, messageId, direction);
      return {
        data: [],
        hasNextPage: false,
      };
    }
    // 处理消息数据
    const data: MessageExt[] = messages.map(msg => ({
      ...msg,
      getKey(item) {
        return item.id;
      },
    }) as MessageExt);
    return {
      data,
      hasNextPage: true,
    }

  }, [conversationId]);


  // 使用通用数据管理 hook
  const {
    loading,
    items,
    hasNextPage,
    error,
    loadMore,
    trimItems,
    trimForwardItems,
    updateItem,
    deleteItem,
  } = useBidirectionalData({
    loadItems,
    initialLoadParams: { backward: { key: 1 << 60 } },
    trimThreshold: 25,
    enableDeduplication: true,
  });


  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleScrollToMessage = (messageId: number) => {
    // 滚动到被回复的消息
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 添加高亮效果
      messageElement.classList.add('highlight');
      setTimeout(() => {
        messageElement.classList.remove('highlight');
      }, 2000);
    }
  };

  // reaction 处理
  const handleReactionClick = (msg: Message, emoji: string) => {
    if (!conversationId) return;

    // 检查当前用户是否已经点击过这个 emoji
    const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
    const hasUserReacted = existingReaction?.users.includes(currentUserId);

    if (hasUserReacted) {
      // 如果用户已经点击过，则删除反应
      removeReaction(conversationId, msg.id, emoji, currentUserId);
    } else {
      // 如果用户没有点击过，则添加反应
      addReaction(conversationId, msg.id, emoji, currentUserId);
    }
  };

  const renderItem = useCallback((item: MessageExt) => {
    return (
      <MessageItem
        key={item.conversation_id + item.id}
        message={item}
        currentUserId={currentUserId}
        onReply={handleReply}
        onReactionClick={handleReactionClick}
        onScrollToMessage={handleScrollToMessage}
      />
    );
  }, [currentUserId, handleReply, handleReactionClick, handleScrollToMessage]);


  const renderLoading = useCallback((refCallback: any) => {
    return <div ref={refCallback} style={{ textAlign: 'center', padding: '1rem' }}>加载中...</div>;
  }, []);

  const renderError = useCallback(() => {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: 'red' }}>
        加载失败，请稍后重试。
      </div>
    );
  }, []);

  return (
    <BidirectionalInfiniteScroll<Message>
      items={items}
      loading={loading}
      hasNextPage={hasNextPage}
      error={error}
      onLoadMore={(params) => loadMore(params)}
      onTrimItems={(direction, count) => {
        if (direction === 'backward') {
          trimItems(count);
        } else {
          trimForwardItems(count);
        }
      }}
      renderItem={renderItem}
      renderLoading={renderLoading}
      renderError={renderError}
      trimThreshold={100}
      scrollThresholdUp={0.25}
      scrollThresholdDown={0.70}
      bottomThreshold={30}
      maxHeight="2000px"
      maxWidth="2000px"
      enableTrimming={true}
      enableBottomLoading={true}
      enableScrollPositionPreservation={true}
      className="mt-4"
      containerClassName="container"
      renderDebugInfo={true}
    />
  );
};

export default MessageList; 