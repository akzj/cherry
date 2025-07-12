import type { EventService } from './types';
import { tauriEventService } from './tauriImpl';
import { mockEventService } from './mockImpl';
import { isTauriEnv } from '@/utils';


// 服务缓存
let eventService: EventService | null = null;

/**
 * 获取事件服务实例
 * @param forceMock 是否强制使用 Mock 服务（测试用）
 */
export const getEventService = (forceMock = false): EventService => {
  if (eventService) return eventService;
  eventService = forceMock ? mockEventService : (isTauriEnv  ? tauriEventService : mockEventService);
  return eventService;
};

// 重置服务（测试时用）
export const resetEventService = () => {
  eventService = null;
};