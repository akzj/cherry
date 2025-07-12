// src/services/eventService/types.ts
import type { CherryMessage } from '@/types';

// 事件监听回调类型
export type EventListener = (message: CherryMessage) => void;

// 事件服务接口
export interface EventService {
  // 监听指定事件
  listen: (eventName: string, listener: EventListener) => Promise<() => void>;
  // 触发事件（用于 Mock 测试）
  emit: (eventName: string, message: CherryMessage) => void;
}