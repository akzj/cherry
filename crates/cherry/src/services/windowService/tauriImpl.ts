// src/services/windowService/tauriImpl.ts
import { Window } from '@tauri-apps/api/window';
import type { WindowService } from './types';

export const tauriWindowService: WindowService = {
  closeCurrentWindow: async () => {
    await Window.getCurrent().close(); // 真实关闭窗口
    // 在每个方法中遇到业务错误时抛出ServiceError，例如：
    // throw new ServiceError('xxx错误信息');
  },
  minimizeCurrentWindow: async () => {
    await Window.getCurrent().minimize();
    // 在每个方法中遇到业务错误时抛出ServiceError，例如：
    // throw new ServiceError('xxx错误信息');
  },
};