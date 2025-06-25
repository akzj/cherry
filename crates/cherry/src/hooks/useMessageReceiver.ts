import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useMessageStore } from '../store/message';
import { useConversationStore } from '../store/conversation';
import { useNotifications } from '../store/notification';
import { CherryMessage, convertBackendMessage } from '../types/types';

export const useMessageReceiver = () => {
  const { addMessage } = useMessageStore();
  const { getConversationById, conversations } = useConversationStore();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // 监听后端发送的cherry-message事件
    const unlisten = listen('cherry-message', (event) => {
      const cherryMessage = event.payload as CherryMessage;
      console.log('Received cherry message:', cherryMessage);

      if ('Message' in cherryMessage) {
        const backendMessage = cherryMessage.Message;
        const frontendMessage = convertBackendMessage(backendMessage);
        
        // 根据消息的用户ID和会话信息确定会话ID
        // 这里需要根据实际业务逻辑来确定消息属于哪个会话
        // 暂时使用第一个会话的ID，实际应用中需要更复杂的逻辑
        let conversationId = 'default';
        if (conversations.length > 0) {
          conversationId = conversations[0].id;
        }
        
        addMessage(conversationId, frontendMessage);
        
        // 添加新消息通知
        addNotification({
          type: 'new_message',
          data: { 
            message: frontendMessage,
            conversationId 
          },
          timestamp: Date.now(),
        });
        
        console.log('Added new message to conversation:', conversationId, frontendMessage);
      } else if ('Event' in cherryMessage) {
        const streamEvent = cherryMessage.Event;
        console.log('Received stream event:', streamEvent);
        
        // 处理流事件
        if (streamEvent.ConversationCreated) {
          addNotification({
            type: 'conversation_created',
            data: { 
              conversationId: streamEvent.ConversationCreated.conversation_id 
            },
            timestamp: Date.now(),
          });
        } else if (streamEvent.ConversationMemberAdded) {
          addNotification({
            type: 'member_added',
            data: { 
              conversationId: streamEvent.ConversationMemberAdded.conversation_id,
              memberId: streamEvent.ConversationMemberAdded.member_id 
            },
            timestamp: Date.now(),
          });
        } else if (streamEvent.ConversationMemberRemoved) {
          addNotification({
            type: 'member_removed',
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
        const backendMessage = cherryMessage.Message;
        const frontendMessage = convertBackendMessage(backendMessage);
        
        let conversationId = 'default';
        if (conversations.length > 0) {
          conversationId = conversations[0].id;
        }
        
        addMessage(conversationId, frontendMessage);
        
        addNotification({
          type: 'new_message',
          data: { 
            message: frontendMessage,
            conversationId 
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
  }, [addMessage, addNotification, conversations]);

  // 返回一个处理消息的函数，供外部调用
  const handleMessage = (message: CherryMessage) => {
    if ('Message' in message) {
      const backendMessage = message.Message;
      const frontendMessage = convertBackendMessage(backendMessage);
      let conversationId = 'default';
      if (conversations.length > 0) {
        conversationId = conversations[0].id;
      }
      addMessage(conversationId, frontendMessage);
    }
  };

  return { handleMessage };
}; 