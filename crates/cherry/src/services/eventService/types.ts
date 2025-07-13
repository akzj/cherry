// src/services/eventService/types.ts
import type { CherryMessage } from '@/types';

// 泛型事件监听回调类型
export type EventListener<T = any> = (message: T) => void;

// 泛型事件服务接口，支持更多场景
export interface EventService<T = any> {
  // 监听指定事件
  listen: (eventName: string, listener: EventListener<T>) => Promise<() => void>;
  // 触发事件（用于 Mock 测试）
  emit: (eventName: string, message: T) => void;
  // 调用Tauri命令
  invoke: <R = any>(command: string, args?: any) => Promise<R>;
}

// 兼容性类型别名，保持向后兼容
export type CherryEventService = EventService<CherryMessage>;