import type { EventService, CherryEventService } from './types';
import { tauriEventService } from './tauriImpl';
import { mockEventService } from './mockImpl';
import { isTauriEnv } from '@/utils';


// 服务缓存
let eventService: CherryEventService | null = null;

/**
 * 获取事件服务实例
 * @param forceMock 是否强制使用 Mock 服务（测试用）
 */
export const getEventService = (forceMock = false): CherryEventService => {
  if (eventService) return eventService;
  eventService = forceMock ? mockEventService : (isTauriEnv  ? tauriEventService : mockEventService);
  return eventService;
};

// 重置服务（测试时用）
export const resetEventService = () => {
  eventService = null;
};

// 导出泛型工厂函数，用于创建特定类型的事件服务
export const createEventService = <T = any>(): EventService<T> => {
  // 这里可以根据需要创建特定类型的服务
  // 目前返回通用的mock服务
  return mockEventService as unknown as EventService<T>;
};