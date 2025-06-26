import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useMessageStore } from '../store/message';
import { useNotifications } from '../store/notification';
import { CherryMessage, convertBackendMessage } from '../types/types';

export const useMessageReceiver = () => {
  const { addMessage, getMessages } = useMessageStore();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // 监听后端发送的cherry-message事件
    const unlisten = listen('cherry-message', (event) => {
      const cherryMessage = event.payload as CherryMessage;
      console.log('Received cherry message:', cherryMessage);

      if ('Message' in cherryMessage) {
        const { message: backendMessage, conversation_id } = cherryMessage.Message;
        const frontendMessage = convertBackendMessage(backendMessage);
        
        // 使用后端提供的 conversation_id 直接添加消息
        console.log('Adding message to conversation:', {
          conversationId: conversation_id,
          messageId: frontendMessage.id,
          content: frontendMessage.content,
          userId: frontendMessage.userId
        });
        
        addMessage(conversation_id, frontendMessage);
        
        // 验证消息是否正确添加
        const currentMessages = getMessages(conversation_id);
        console.log('Current messages in conversation', conversation_id, ':', currentMessages.length);
        
        // 添加新消息通知
        addNotification({
          type: 'new_message',
          data: { 
            message: frontendMessage,
            conversationId: conversation_id
          },
          timestamp: Date.now(),
        });
        
        console.log('Added new message to conversation:', conversation_id, frontendMessage);
      } else if ('Event' in cherryMessage) {
        const { event: streamEvent } = cherryMessage.Event;
        console.log('Received stream event:', streamEvent);
        
        // 处理流事件
        if (streamEvent.ConversationCreated) {
          addNotification({
            type: 'conversations_updated',
            data: { 
              conversationId: streamEvent.ConversationCreated.conversation_id 
            },
            timestamp: Date.now(),
          });
        } else if (streamEvent.ConversationMemberAdded) {
          addNotification({
            type: 'new_message',
            data: { 
              conversationId: streamEvent.ConversationMemberAdded.conversation_id,
              memberId: streamEvent.ConversationMemberAdded.member_id 
            },
            timestamp: Date.now(),
          });
        } else if (streamEvent.ConversationMemberRemoved) {
          addNotification({
            type: 'new_message',
            data: { 
              conversationId: streamEvent.ConversationMemberRemoved.conversation_id,
              memberId: streamEvent.ConversationMemberRemoved.member_id 
            },
            timestamp: Date.now(),
          });
        }
      }
    });

    // 同时监听全局的cherry-message事件（从auth store发送的）
    const handleGlobalMessage = (event: CustomEvent) => {
      const cherryMessage = event.detail as CherryMessage;
      console.log('Received global cherry message:', cherryMessage);

      if ('Message' in cherryMessage) {
        const { message: backendMessage, conversation_id } = cherryMessage.Message;
        const frontendMessage = convertBackendMessage(backendMessage);
        
        // 使用后端提供的 conversation_id 直接添加消息
        addMessage(conversation_id, frontendMessage);
        
        addNotification({
          type: 'new_message',
          data: { 
            message: frontendMessage,
            conversationId: conversation_id
          },
          timestamp: Date.now(),
        });
      }
    };

    // 添加全局事件监听器
    window.addEventListener('cherry-message', handleGlobalMessage as EventListener);

    return () => {
      unlisten.then(f => f());
      window.removeEventListener('cherry-message', handleGlobalMessage as EventListener);
    };
  }, [addMessage, addNotification, getMessages]);

  // 返回一个处理消息的函数，供外部调用
  const handleMessage = (message: CherryMessage) => {
    if ('Message' in message) {
      const { message: backendMessage, conversation_id } = message.Message;
      const frontendMessage = convertBackendMessage(backendMessage);
      addMessage(conversation_id, frontendMessage);
    }
  };

  return { handleMessage };
}; 