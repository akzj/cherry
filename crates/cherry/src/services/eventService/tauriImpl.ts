// src/services/eventService/tauriImpl.ts
import { listen as tauriListen } from '@tauri-apps/api/event';
import type { EventService, EventListener } from './types';
import type { CherryMessage } from '@/types';

export const tauriEventService: EventService = {
  // 监听 Tauri 事件
  listen: async (eventName: string, listener: EventListener) => {
    // 调用 Tauri 的 listen API
    const unlisten = await tauriListen(eventName, (event) => {
      // 转发事件给回调（确保类型正确）
      listener(event.payload as CherryMessage);
    });
    // 返回取消监听的函数
    return unlisten;
  },

  // 触发事件（Tauri 环境下可直接调用，用于调试）
  emit: (eventName: string, message: CherryMessage) => {
    // 在 Tauri 中可通过 invoke 调用后端触发事件，这里简化为日志
    console.log(`[Tauri] 触发事件 ${eventName}:`, message);
  },
};