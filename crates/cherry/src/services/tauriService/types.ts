// src/services/tauriService/types.ts
import type { CherryMessage } from '@/types';

// Tauri事件监听回调类型
export type TauriEventListener = (event: { payload: any }) => void;

// Tauri服务接口
export interface TauriService {
  // 监听Tauri事件
  listen: (eventName: string, listener: TauriEventListener) => Promise<() => void>;
  // 触发事件（用于调试和测试）
  emit: (eventName: string, payload: any) => void;
  // 调用Tauri命令
  invoke: (command: string, args?: any) => Promise<any>;
} 