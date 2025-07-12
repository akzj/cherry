// src/services/tauriService/mockImpl.ts
import type { TauriService, TauriEventListener } from './types';

// 存储事件监听器
const eventListeners = new Map<string, TauriEventListener[]>();

export const mockTauriService: TauriService = {
  // Mock 监听事件
  listen: async (eventName: string, listener: TauriEventListener) => {
    if (!eventListeners.has(eventName)) {
      eventListeners.set(eventName, []);
    }
    eventListeners.get(eventName)!.push(listener);
    
    // 返回取消监听的函数
    return () => {
      const listeners = eventListeners.get(eventName);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  },

  // Mock 触发事件
  emit: (eventName: string, payload: any) => {
    const listeners = eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        listener({ payload });
      });
    }
    console.log(`[Mock Tauri] 触发事件 ${eventName}:`, payload);
  },

  // Mock 调用命令
  invoke: async (command: string, args?: any) => {
    console.log(`[Mock Tauri] 调用命令 ${command}:`, args);
    
    // 根据命令返回不同的mock数据
    switch (command) {
      case 'get_user_info':
        return {
          user_id: 'mock-user-1',
          username: 'Mock User',
          avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg'
        };
      case 'get_conversations':
        return [
          {
            id: 'conv-1',
            name: 'Mock Conversation 1',
            last_message: 'Hello from mock!',
            timestamp: Date.now()
          }
        ];
      default:
        return { success: true, message: 'Mock command executed' };
    }
  },
}; 