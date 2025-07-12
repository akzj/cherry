// src/services/eventService/mockImpl.ts
import type { EventService, EventListener } from './types';
import type { CherryMessage } from '@/types';

const listeners = new Map<string, EventListener[]>();

export const mockEventService: EventService = {
  listen: async (eventName: string, listener: EventListener) => {
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
  },
};