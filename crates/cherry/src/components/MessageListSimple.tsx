import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Message, ImageContent } from '../types/types';
import { useMessageStore } from '../store/message';
import { appCacheDir } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { path } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/core';
import QuickEmojiReply from './UI/QuickEmojiReply';

const appCacheDirPath = await appCacheDir();

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  conversationId?: string;
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
  min-height: 0; /* 重要：允许在flex容器中正确收缩 */
  height: 100%;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
  
  /* 高亮动画效果 */
  .highlight {
    animation: highlightPulse 2s ease-in-out;
  }
  
  @keyframes highlightPulse {
    0% {
      background-color: rgba(99, 102, 241, 0.2);
      transform: scale(1);
    }
    50% {
      background-color: rgba(99, 102, 241, 0.3);
      transform: scale(1.02);
    }
    100% {
      background-color: transparent;
      transform: scale(1);
    }
  }
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

const MessageActions = styled.div`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${MessageContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  padding: 0.25rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
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

// 异步图片组件
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

// 解析消息内容的辅助函数
const parseMessageContent = (content: string | ImageContent): { type: 'text' | 'image', text?: string, imageUrl?: string } => {
  if (typeof content === 'string') {
    // 尝试解析为 ImageContent
    try {
      const parsed = JSON.parse(content);
      if (parsed.url && parsed.thumbnail_url) {
        return {
          type: 'image',
          text: parsed.text || undefined,
          imageUrl: parsed.url
        };
      }
    } catch {
      // 解析失败，当作普通文本
    }
    return { type: 'text', text: content };
  } else {
    // 已经是 ImageContent 对象
    return {
      type: 'image',
      text: content.text || undefined,
      imageUrl: content.url
    };
  }
};

const ReactionBar = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
  margin-bottom: 2px;
`;
const ReactionIcon = styled.button<{ active?: boolean }>`
  background: ${({ active }) => (active ? 'rgba(99,219,139,0.25)' : 'rgba(99,219,139,0.10)')};
  border: 1.5px solid #6bd38b;
  color: #222;
  border-radius: 12px;
  font-size: 1.05rem;
  padding: 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: ${({ active }) => (active ? 1 : 0.8)};
  transition: all 0.15s;
  &:hover {
    background: #b1e6c7;
    opacity: 1;
  }
`;

// ==================== Component Implementation ====================
const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, conversationId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const { setReplyingTo, sendMessage, addReaction, removeReaction } = useMessageStore();

  // MessageList render

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  // 监听消息变化，新消息时滚动到底部
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;

    // Messages changed for conversation

    // 如果有新消息添加，滚动到底部
    if (currentLength > prevLength && prevLength > 0) {
      // New messages detected, scrolling to bottom
      scrollToBottom();
    }
    // 如果是第一次加载消息，立即滚动到底部
    else if (prevLength === 0 && currentLength > 0) {
      // Initial messages loaded, scrolling to bottom instantly
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

  // 快速表情回复
  const handleQuickReply = async (targetMessage: Message, emoji: string) => {
    if (!conversationId) return;
    // 直接发送表情作为内容，reply_to 指向目标消息
    await sendMessage(
      conversationId,
      emoji,
      'emoji',
      targetMessage.id
    );
  };

  // reaction 处理
  const handleReactionClick = (msg: Message, emoji: string) => {
    if (!conversationId) return;
    // 允许同一用户多次点同一emoji
    addReaction(conversationId, msg.id, emoji, currentUserId);
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.userId === currentUserId;
    const parsedContent = parseMessageContent(message.content);

    return (
      <MessageContainer key={message.id} $isOwn={isOwn} data-message-id={message.id} className="message-container">
        <MessageBubble $isOwn={isOwn} $isReply={message.isReply}>
        <QuickEmojiReply onReply={emoji => handleReactionClick(message, emoji)} />
          {/* reaction bar */}
          {message.reactions && message.reactions.length > 0 && (
            <ReactionBar>
              {message.reactions.map(r => (
                <ReactionIcon
                  key={r.emoji + r.users.length}
                  active={r.users.includes(currentUserId)}
                  onClick={() => handleReactionClick(message, r.emoji)}
                  title={r.emoji}
                >
                  {r.emoji} {r.users.length > 1 ? r.users.length : ''}
                </ReactionIcon>
              ))}
            </ReactionBar>
          )}
          {/* 回复连接线 */}
          {message.isReply && <ReplyConnection $isOwn={isOwn} />}

          <MessageActions>
            <ActionButton onClick={() => handleReply(message)} title="回复">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,17 15,17 15,11 21,11 21,5 15,5 15,11 9,11"></polyline>
                <path d="M3,13 L3,19 L9,19"></path>
              </svg>
            </ActionButton>
          </MessageActions>

          <MessageHeader>
            <Username>{message.userId}</Username>
            <Timestamp>{formatTime(message.timestamp)}</Timestamp>
          </MessageHeader>

          {/* 新的回复引用显示 */}
          {message.isReply && message.replyToMessage && (
            <ReplyQuote
              $isOwn={isOwn}
              onClick={() => handleScrollToMessage(message.replyToMessage!.id)}
            >
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
                  const replyContent = parseMessageContent(message.replyToMessage.content);
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
                <MessageImage url={parsedContent.imageUrl!} />
                {parsedContent.text && (
                  <ImageText>{parsedContent.text}</ImageText>
                )}
              </ImageContainer>
            ) : (
              parsedContent.text
            )}
          </MessageContent>


        </MessageBubble>
      </MessageContainer>
    );
  };

  return (
    <Container ref={containerRef} data-conversation-id={conversationId}>
      {messages.map(renderMessage)}
      <div ref={messagesEndRef} />
    </Container>
  );
};

export default MessageList; 