import React, { useRef, useCallback, ReactNode, useImperativeHandle } from 'react';
import { Message } from '@/types';

import { messageService } from '@/services/messageService';
import { ReactNodes, ScrollU, ScrollURef } from 'scroll-u'
import MessageItem, { MessageNodeProps } from './messageItem.tsx';



export interface MessageListRef {
  onSendMessageEvent: () => void;
}

interface MessageListProps {
  currentUserId: string;
  conversationId: string;
  setReplyingTo: (message: Message | null) => void;
}


export const addReaction = async (conversationId: string, messageId: number, emoji: string, userId: string) => {
  await messageService.sendMessage(
    conversationId,
    JSON.stringify({ emoji, users: userId, action: 'add', targetMessageId: messageId }),
    'reaction'
  );
};

export const removeReaction = async (conversationId: string, messageId: number, emoji: string, userId: string) => {
  await messageService.sendMessage(
    conversationId,
    JSON.stringify({ emoji, users: userId, action: 'remove', targetMessageId: messageId }),
    'reaction'
  );
};


const MessageList = React.forwardRef<MessageListRef, MessageListProps>((props, ref) => {
  const { currentUserId, conversationId, setReplyingTo } = props;
  useImperativeHandle(ref, () => ({
    onSendMessageEvent: () => {
      console.log('MessageList: onSendMessageEvent called');
      // 这里可以添加发送消息后的逻辑，比如重新加载消息列表
      fetchMessages();
    }
  }));

  const scrollURef = useRef<ScrollURef>(null);

  //初始化，尝试获取新的消息列表
  const fetchMessages = React.useCallback(async () => {
    if (!conversationId) return;
    const messages = await messageService.loadMessages(conversationId, 0, 'backward', 25);
    console.log(messages);
    if (scrollURef.current) {
      scrollURef.current.updateNodes((nodes: ReactNodes): ReactNodes => {
        return messages.map(item =>
        (<MessageItem
          key={item.conversation_id + item.id}
          message={item}
          currentUserId={currentUserId}
          onReply={handleReply}
          onReactionClick={handleReactionClick}
          onScrollToMessage={handleScrollToMessage}
        />
        )
        )
      });
    }
  }, [conversationId]);

  React.useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, [setReplyingTo])

  //初始化，尝试获取新的消息列表

  const handleScrollToMessage = useCallback((messageId: string) => {
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
  }, []);

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


  function getMessageProps(node: ReactNode): MessageNodeProps | undefined {
    if (node && React.isValidElement(node)) {
      return node.props as MessageNodeProps;
    }
    return undefined;
  }


  const loadMore = useCallback(async (direction: 'pre' | 'next', node: React.ReactNode): Promise<React.ReactNode[]> => {
    const props = getMessageProps(node)!;
    const messageId = props.message.id;
    const messages = await messageService.loadMessages(conversationId, messageId, direction == 'pre' ? 'backward' : 'forward', 10);
    if (messages.length === 0) {
      console.info('no more message:', props, direction);
      return [];
    }
    return messages.map(item => (
      <MessageItem
        key={item.conversation_id + item.id}
        message={item}
        currentUserId={currentUserId}
        onReply={handleReply}
        onReactionClick={handleReactionClick}
        onScrollToMessage={handleScrollToMessage}
      />
    ));
  }, [currentUserId, handleReply, handleReactionClick, handleScrollToMessage]);

  return (
    <ScrollU
      ref={scrollURef}
      renderItem={loadMore}
    />
  );
});

export default MessageList; 