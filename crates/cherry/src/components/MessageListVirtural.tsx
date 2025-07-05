import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { VariableSizeList as List, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { throttle } from 'lodash';
import { Message, parseMessageContent } from '../types/types';
import { useMessageStore } from '../store/message';
import { appCacheDir } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { path } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/core';
import QuickEmojiReply from './UI/QuickEmojiReply';
import { sendMessage, addReaction, removeReaction } from '../api/api';

const appCacheDirPath = await appCacheDir();

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  conversationId?: string;
  setReplyingTo: (message: Message | null) => void;
}

// ==================== Styled Components ====================
const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 0;
  height: 100%;
`;

const MessageContainer = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  align-self: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 70%;
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
`;

const ReplyConnection = styled.div<{ $isOwn: boolean }>`
  position: absolute;
  left: ${props => props.$isOwn ? 'auto' : '-8px'};
  right: ${props => props.$isOwn ? '-8px' : 'auto'};
  top: -12px;
  width: 16px;
  height: 16px;
`;

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

const MessageImage: React.FC<{ url: string }> = ({ url }) => {
  const [src, setSrc] = useState<string>();

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
      const path = await getFile(url);
      if (mounted) setSrc(path as string);
    })();
    return () => { mounted = false; };
  }, [url]);

  if (!src) return <span>图片加载中...</span>;
  return <img src={`cherry://localhost?file_path=${src}`} style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', margin: '4px 0' }} />;
};

const ReactionBar = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
  margin-bottom: 2px;
`;

const ReactionIcon = styled.button<{ $active?: boolean }>`
  border-radius: 12px;
  font-size: 1.05rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  opacity: ${({ $active }) => ($active ? 1 : 0.8)};
  transition: all 0.15s;
  &:hover {
    transform: translate3d(1px, 1px, 3px) rotate3d(1, 3, 10, 15deg);
    opacity: 1;
  }
`;

// ==================== Component Implementation ====================
const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  conversationId,
  setReplyingTo,
}) => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [messageHeights, setMessageHeights] = useState<{ [id: number]: number }>({});
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(20); // 初始加载 20 条消息
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const listRef = useRef<any>(null); // List instance for resetAfterIndex

  useEffect(() => {
    const loadMessages = async () => {
        console.log("loadMessages", startIndex, endIndex);
      const loadedMessages = await fetchMessages(startIndex, endIndex);
      setVisibleMessages(loadedMessages);
      setMessageHeights(new Array(loadedMessages.length).fill(200)); // 初始化高度缓存
    };

    loadMessages();
  }, [startIndex, endIndex]);

  const fetchMessages = async (start: number, end: number) => {
    // 模拟从服务器加载数据
    return new Promise<Message[]>((resolve) => {
      setTimeout(() => {
        const slicedMessages = messages.slice(start, end);
        console.log('Sliced messages:', slicedMessages);
        resolve(slicedMessages);
      }, 500);
    });
  };

  const loadMore = () => {
    setStartIndex((prev) => prev - 20);
    setEndIndex((prev) => prev + 20);
  };

  const handleScroll = useCallback(
    throttle(({ scrollDirection }) => {
      if (scrollDirection === 'backward' && startIndex > 0) {
        loadMore();
      }
    }, 200),
    [startIndex, loadMore]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;

    if (currentLength > prevLength && prevLength > 0) {
      scrollToBottom();
    } else if (prevLength === 0 && currentLength > 0) {
      setTimeout(() => scrollToBottomInstant(), 100);
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages, conversationId]);

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleScrollToMessage = (messageId: number) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight');
      setTimeout(() => {
        messageElement.classList.remove('highlight');
      }, 2000);
    }
  };

  const handleReactionClick = (msg: Message, emoji: string) => {
    if (!conversationId) return;

    const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
    const hasUserReacted = existingReaction?.users.includes(currentUserId);

    if (hasUserReacted) {
      removeReaction(conversationId, msg.id, emoji, currentUserId);
    } else {
      addReaction(conversationId, msg.id, emoji, currentUserId);
    }
  };

  // Whenever visibleMessages changes, ensure messageHeights has all keys
  useEffect(() => {
    setMessageHeights((prev) => {
      const next = { ...prev };
      visibleMessages.forEach((msg) => {
        if (!(msg.id in next)) next[msg.id] = 120; // fallback default
      });
      return next;
    });
  }, [visibleMessages]);

  const handleResize = (messageId: number, index?: number) => {
    const element = document.querySelector(`[data-message-id="${messageId}"]`);
    if (element) {
      const height = (element as HTMLElement).offsetHeight;
      setMessageHeights((prevHeights) => ({
        ...prevHeights,
        [messageId]: height,
      }));
      if (typeof index === 'number' && listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = visibleMessages[index];
    const isOwn = message.userId === currentUserId;
    const parsedContent = parseMessageContent(message.content, message.type);

    // Observe resize for dynamic content
    useEffect(() => {
      const observer = new ResizeObserver(() => handleResize(message.id, index));
      const element = document.querySelector(`[data-message-id="${message.id}"]`);
      if (element) {
        observer.observe(element);
      }
      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    }, [message.id, index]);

    // For images, update height after load
    const ImageWithResize: React.FC<{ url: string }> = ({ url }) => {
      const [src, setSrc] = useState<string>();
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
          const path = await getFile(url);
          if (mounted) setSrc(path as string);
        })();
        return () => { mounted = false; };
      }, [url]);
      if (!src) return <span>图片加载中...</span>;
      return <img src={`cherry://localhost?file_path=${src}`} style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', margin: '4px 0' }} onLoad={() => handleResize(message.id, index)} />;
    };

    // For quill content, update height after render
    useEffect(() => {
      if (parsedContent.type === 'quill') {
        setTimeout(() => handleResize(message.id, index), 50);
      }
    }, [parsedContent.html, message.id, index]);

    return (
      <MessageContainer key={message.id} $isOwn={isOwn} data-message-id={message.id} style={style}>
        <MessageBubble $isOwn={isOwn} $isReply={message.isReply} style={{ minHeight: 48 }}>
          <QuickEmojiReply
            onReply={emoji => handleReactionClick(message, emoji)}
            onReplyMessage={() => handleReply(message)}
          />

          {message.isReply && <ReplyConnection $isOwn={isOwn} />}

          <MessageHeader>
            <Username>{message.userId}</Username>
            <Timestamp>{formatTime(message.timestamp)}</Timestamp>
          </MessageHeader>

          {message.isReply && message.replyToMessage && (
            <ReplyQuote $isOwn={isOwn} onClick={() => handleScrollToMessage(message.replyToMessage!.id)}>
              <ReplyQuoteHeader>
                <ReplyQuoteIcon>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 17h3l2-4V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l2 4z" />
                    <path d="M9 12a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1z" />
                  </svg>
                </ReplyQuoteIcon>
                <ReplyQuoteAuthor>{message.replyToMessage.userId}</ReplyQuoteAuthor>
              </ReplyQuoteHeader>
              <ReplyQuoteContent>
                {(() => {
                  const replyContent = parseMessageContent(message.replyToMessage.content, message.replyToMessage.type);
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
                <ImageWithResize url={parsedContent.imageUrl!} />
                {parsedContent.text && <ImageText>{parsedContent.text}</ImageText>}
              </ImageContainer>
            ) : parsedContent.type === 'quill' && parsedContent.html ? (
              <div dangerouslySetInnerHTML={{ __html: parsedContent.html }} />
            ) : (
              parsedContent.text
            )}
          </MessageContent>

          {message.reactions && message.reactions.length > 0 && (
            <ReactionBar>
              {message.reactions.map(r => (
                <ReactionIcon
                  key={r.emoji + r.users.length}
                  $active={r.users.includes(currentUserId)}
                  onClick={() => handleReactionClick(message, r.emoji)}
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
  };

  const getItemSize = useCallback((index: number) => {
    const message = visibleMessages[index];
    return messageHeights[message?.id] || 120;
  }, [messageHeights, visibleMessages]);

  return (
    <Container ref={containerRef} data-conversation-id={conversationId}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            height={height}
            itemCount={visibleMessages.length}
            itemSize={getItemSize}
            width={width}
            onScroll={handleScroll}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
      <div ref={messagesEndRef} />
    </Container>
  );
};

export default MessageList;