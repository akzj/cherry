// src/services/windowService/tauriImpl.ts
import { Window } from '@tauri-apps/api/window';
import type { WindowService } from './types';

export const tauriWindowService: WindowService = {
  closeCurrentWindow: async () => {
    await Window.getCurrent().close(); // 真实关闭窗口
  },
  minimizeCurrentWindow: async () => {
    await Window.getCurrent().minimize();
  },
};