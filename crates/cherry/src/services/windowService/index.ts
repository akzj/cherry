// src/services/windowService/index.ts
import type { WindowService } from './types';
import { tauriWindowService } from './tauriImpl';
import { mockWindowService } from './mockImpl';
import { isTauriEnv } from '@/utils'

/**
 * 获取窗口服务实例（自动适配环境）
 * @returns 环境对应的 WindowService 实现
 */
export function getWindowService(): WindowService {
    // 环境判断逻辑（封装在这里）
    return isTauriEnv ? tauriWindowService : mockWindowService;
}