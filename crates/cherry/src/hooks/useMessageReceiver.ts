// src/hooks/useMessageReceiver.ts
import { useEffect, useState } from 'react';
import { getEventService } from '../services/eventService';
import type { CherryMessage, Message, StreamEvent } from '../types';

export const useMessageReceiver = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const eventService = getEventService();

    const startListening = async () => {
      try {
        // 监听 'cherry-message' 事件
        unlisten = await eventService.listen('cherry-message', (msg: CherryMessage) => {
          // 类型判断：是普通消息还是流事件
          if ('message' in msg) {
            // 处理普通消息
            const newMessage = msg.message;
            setMessages(prev => [...prev, newMessage]);
          } else if ('event' in msg) {
            // 处理流事件
            const newEvent = msg.event;
            setStreamEvents(prev => [...prev, newEvent]);
            console.log('Received stream event:', newEvent);
          } else {
            console.warn('Unknown message structure:', msg);
          }
        });

        setIsListening(true);
      } catch (error) {
        console.error('Failed to start listening:', error);
        setIsListening(false);
      }
    };

    startListening();

    return () => {
      if (unlisten) {
        unlisten();
        setIsListening(false);
      }
    };
  }, []);

  return {
    messages,       // 所有普通消息
    streamEvents,   // 所有流事件
    isListening,    // 监听状态
    clearMessages: () => setMessages([]),
    clearEvents: () => setStreamEvents([]),
  };
};