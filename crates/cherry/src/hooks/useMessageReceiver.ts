import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { CherryMessage, Message, StreamEvent } from '../types/types';

export const useMessageReceiver = () => {
  useEffect(() => {
    let unlistenFn: (() => void) | undefined;
    
    const setupListener = async () => {
      unlistenFn = await listen('cherry-message', (event) => {
        const cherryMessage = event.payload as CherryMessage;
        if ('message' in cherryMessage) {
            const message: Message = cherryMessage.message;
        } else if ('event' in cherryMessage) {
          const streamEvent = cherryMessage.event as StreamEvent;
          console.log('Received stream event', streamEvent);
          // Received stream event
          
          // 处理流事件
        //   if (streamEvent.ConversationCreated) {
        //     addNotification({
        //       type: 'conversations_updated',
        //       data: { 
        //           conversationId: streamEvent.ConversationCreated.conversation_id 
        //         },
        //       timestamp: Date.now(),
        //     });
        //   } else if (streamEvent.ConversationMemberAdded) {
        //     addNotification({
        //       type: 'new_message',
        //       data: { 
        //           conversationId: streamEvent.ConversationMemberAdded.conversation_id,
        //           memberId: streamEvent.ConversationMemberAdded.member_id 
        //         },
        //       timestamp: Date.now(),
        //     });
        //   } else if (streamEvent.ConversationMemberRemoved) {
        //     addNotification({
        //       type: 'new_message',
        //       data: { 
        //           conversationId: streamEvent.ConversationMemberRemoved.conversation_id,
        //           memberId: streamEvent.ConversationMemberRemoved.member_id 
        //         },
        //       timestamp: Date.now(),
        //     });
        //   }
        }
      });
    };
    
     setupListener();
    
    return () => {
      if (unlistenFn) {
        unlistenFn();
      }
    };
  }, []);


  return {  };
}; 