import React, { useRef, useCallback, useImperativeHandle } from 'react';
import { Message } from '@/types';

import { messageService } from '@/services/messageService';
import { ElementWithKey, ScrollU, ScrollURef } from '@/components/scroll-u';
import MessageItem, { MessageItemProps } from './messageItem.tsx';
import { listenerService } from '@/services/listenService/index.ts';
import { makeNewMessageEvent } from '@/types/events.ts';
import { ElementWithKeyArr } from '@/components/scroll-u/scroll-u.tsx';



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
    JSON.stringify({ emoji, users: userId, action: 'add', message_id: messageId }),
    'reaction'
  );
};

export const removeReaction = async (conversationId: string, messageId: number, emoji: string, userId: string) => {
  await messageService.sendMessage(
    conversationId,
    JSON.stringify({ emoji, users: userId, action: 'remove', message_id: messageId }),
    'reaction'
  );
};


const onCopyMessage = (message: Message) => {
  if (message.content) {
    navigator.clipboard.writeText(message.content as string);
    console.log('Message copied to clipboard:', message.content);
  } else {
    console.warn('Message content is empty, cannot copy');
  }
}

const MessageList = React.forwardRef<MessageListRef, MessageListProps>((props, ref) => {
  const { currentUserId, conversationId, setReplyingTo } = props;
  
  const scrollURef = useRef<ScrollURef>(null);

  useImperativeHandle(ref, () => ({
    onSendMessageEvent: () => {
      //  console.log('MessageList: onSendMessageEvent called');
      // 这里可以添加发送消息后的逻辑，比如重新加载消息列表
      ///fetchMessages();
    }
  }));

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, [setReplyingTo]);

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
  const handleReactionClick = useCallback((msg: Message, emoji: string) => {
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
  }, [conversationId, currentUserId]);

  const mewMessageHandler = useCallback((message: Message) => {
    console.log('MessageList: New message received', message);
    if (message.conversation_id === conversationId) {
      console.log('MessageList: Message for current conversation, updating elements');
      if (scrollURef.current) {
        scrollURef.current.updateElements((elements: ElementWithKey[]): ElementWithKey[] => {
          console.log('MessageList: Current elements count:', elements.length);
          let replaced = false;
          
          // 先检查是否已存在，如果存在则更新
          const updatedElements = elements.map((node: ElementWithKey) => {
            if (
              React.isValidElement(node) &&
              (node as React.ReactElement<MessageItemProps>).props.message.id === message.id
            ) {
              const existingProps = (node as React.ReactElement<MessageItemProps>).props;
              
              // 浅比较：只有真正变化时才更新
              if (
                existingProps.message.content !== message.content ||
                existingProps.message.timestamp !== message.timestamp ||
                existingProps.message.type_ !== message.type_ ||
                JSON.stringify(existingProps.message.reactions) !== JSON.stringify(message.reactions)
              ) {
                replaced = true;
                return (
                  <MessageItem
                    key={message.conversation_id + message.id}
                    currentUserId={currentUserId}
                    message={message}
                    onReactionClick={handleReactionClick}
                    onReply={handleReply}
                    onScrollToMessage={handleScrollToMessage}
                    onCopyMessage={onCopyMessage}
                  />
                );
              }
              // 如果没有变化，返回原来的节点
              return node;
            }
            return node;
          });
          
          // 如果替换了现有消息，直接返回
          if (replaced) {
            console.log('MessageList: Message updated', message.id);
            return updatedElements as ElementWithKey[];
          }

          // 如果是新消息，添加到末尾
          console.log('MessageList: Adding new message to end');
          const newElements = [
            ...elements,
            (
              <MessageItem
                key={message.conversation_id + message.id}
                currentUserId={currentUserId}
                message={message}
                onReactionClick={handleReactionClick}
                onReply={handleReply}
                onScrollToMessage={handleScrollToMessage}
                onCopyMessage={onCopyMessage}
              />
            ) as ElementWithKey,
          ];
          console.log('MessageList: New elements count:', newElements.length);
          return newElements;
        });
      }
    } else {
      console.warn('MessageList: Received message for different conversation', {
        messageConversationId: message.conversation_id,
        currentConversationId: conversationId,
      });
    }
  }, [conversationId, currentUserId, handleReply, handleReactionClick, handleScrollToMessage]);

  // 添加监听器
  React.useEffect(() => {
    listenerService.on(makeNewMessageEvent(conversationId), mewMessageHandler);
    console.log('MessageList: Listener added for conversation', conversationId);
    return () => {
      // 清理监听器
      listenerService.off(makeNewMessageEvent(conversationId), mewMessageHandler);
      console.log('MessageList: Listener removed for conversation', conversationId);
    };
  }, [conversationId, mewMessageHandler]);

  //初始化，尝试获取新的消息列表
  const fetchMessages = React.useCallback(async () => {
    if (!conversationId) return;
    const messages = await messageService.loadMessages(conversationId, 0, 'backward', 50);
    console.log(messages);
    if (scrollURef.current) {
      scrollURef.current.updateElements((): ElementWithKeyArr => {
        return messages.map(item =>
        (<MessageItem
          key={item.conversation_id + item.id}
          message={item}
          currentUserId={currentUserId}
          onReply={handleReply}
          onReactionClick={handleReactionClick}
          onScrollToMessage={handleScrollToMessage}
          onCopyMessage={onCopyMessage}
        />
        )
        ) as ElementWithKeyArr;
      });
    }
  }, [conversationId, currentUserId, handleReply, handleReactionClick, handleScrollToMessage]);

  React.useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);




  const loadMore = useCallback(async (direction: 'pre' | 'next', contextData?: any): Promise<any[]> => {
    // contextData is expected to be ElementWithKey<any>
    const props = contextData && contextData.props ? contextData.props as MessageItemProps : undefined;
    const messageId = props?.message?.id;
    if (!messageId) {
      console.warn('MessageList: loadMore called without messageId', props);
      return [];
    }
    const messages = await messageService.loadMessages(conversationId, messageId, direction === 'pre' ? 'backward' : 'forward', 10);
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
        onCopyMessage={onCopyMessage}
      />
    ));
  }, [currentUserId, handleReply, handleReactionClick, handleScrollToMessage]);

  return (
    <ScrollU
      ref={scrollURef}
      renderMore={loadMore}
    />
  );
});

export default MessageList; 