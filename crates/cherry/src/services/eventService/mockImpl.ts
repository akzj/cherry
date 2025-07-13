// src/services/eventService/mockImpl.ts
import type { EventService, EventListener } from './types';
import type { CherryMessage } from '@/types';

const listeners = new Map<string, EventListener<any>[]>();

export const mockEventService: EventService<CherryMessage> = {
  listen: async (eventName: string, listener: EventListener<CherryMessage>) => {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, []);
    }
    listeners.get(eventName)!.push(listener);

    return () => {
      const currentListeners = listeners.get(eventName);
      if (currentListeners) {
        listeners.set(
          eventName,
          currentListeners.filter(l => l !== listener)
        );
      }
    };
  },
  emit: (eventName: string, message: CherryMessage) => {
    const currentListeners = listeners.get(eventName);
    if (currentListeners) {
      currentListeners.forEach(listener => {
        try {
          listener(message); // 直接传递 CherryMessage 类型
        } catch (error) {
          console.error(`事件处理失败: ${error}`);
        }
      });
    }
    console.log(`[Mock] 触发事件 ${eventName}:`, message);
  },

  // Mock 调用命令
  invoke: async <R = any>(command: string, args?: any): Promise<R> => {
    console.log(`[Mock] 调用命令 ${command}:`, args);
    
    // 根据命令返回不同的mock数据
    switch (command) {
      case 'get_user_info':
        return {
          user_id: 'mock-user-1',
          username: 'Mock User',
          avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg'
        } as R;
      case 'get_conversations':
        return [
          {
            id: 'conv-1',
            name: 'Mock Conversation 1',
            last_message: 'Hello from mock!',
            timestamp: Date.now()
          }
        ] as R;
      default:
        return { success: true, message: 'Mock command executed' } as R;
    }
  },
};