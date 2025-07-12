// src/services/authService/index.ts
import type { AuthService } from './types';
import { tauriAuthService } from './tauriImpl';
import { mockAuthService, setAuthMockConfig } from './mockImpl';
import { isTauriEnv } from '@/utils';

// 环境判断（先检查 window 是否存在，避免 SSR 报错）


// 服务缓存（测试时通过 reset 清除）
let authService: AuthService | null = null;

/**
 * 获取认证服务实例
 * @param forceMock 是否强制使用 Mock 服务（测试用）
 */
export const getAuthService = (forceMock = false): AuthService => {
  if (authService) return authService;
  authService = forceMock ? mockAuthService : (isTauriEnv ? tauriAuthService : mockAuthService);
  return authService;
};

/**
 * 重置服务缓存（测试前调用，避免交叉污染）
 */
export const resetAuthService = (): void => {
  authService = null;
};

export { setAuthMockConfig };