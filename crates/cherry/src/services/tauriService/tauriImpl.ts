// src/services/tauriService/tauriImpl.ts

import { invoke, Channel } from '@tauri-apps/api/core';
import type { TauriService, TauriEventListener } from './types';
import { listen } from '@tauri-apps/api/event';

export const tauriService: TauriService = {
  // 监听 Tauri 事件
  listen: async (eventName: string, listener: TauriEventListener) => {
    // 调用 Tauri 的 listen API
    const unlisten = await listen(eventName, listener);
    // 返回取消监听的函数
    return unlisten;
  },

  // 触发事件（Tauri 环境下可直接调用，用于调试）
  emit: (eventName: string, payload: any) => {
    // 在 Tauri 中可通过 invoke 调用后端触发事件，这里简化为日志
    console.log(`[Tauri] 触发事件 ${eventName}:`, payload);
  },

  // 调用 Tauri 命令
  invoke: async (command: string, args?: any) => {
    return await invoke(command, args);
  },
}; 