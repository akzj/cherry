// src/services/tauriService/index.ts
import { tauriService } from './tauriImpl';
import { mockTauriService } from './mockImpl';
import type { TauriService } from './types';

// 根据环境选择实现
export const getTauriService = (): TauriService => {
  // 检查是否在Tauri环境中
  if (typeof window !== 'undefined' && window.__TAURI__) {
    return tauriService;
  }
  
  // 在测试环境或非Tauri环境中使用mock
  return mockTauriService;
};

// 导出默认服务实例
export const tauriServiceInstance = getTauriService();

// 导出类型
export type { TauriService, TauriEventListener } from './types'; 