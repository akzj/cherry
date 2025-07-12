// src/services/windowService/mockImpl.ts
import type { WindowService } from './types';

export const mockWindowService: WindowService = {
  closeCurrentWindow: async () => {
    // 模拟关闭窗口：在控制台打印日志，或显示提示（便于 Storybook 中观察）
    console.log('[Mock] 模拟关闭窗口（实际不会关闭）');
    // 可选：在 Storybook 中触发一个自定义事件，供测试捕获
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mock-window-closed', { detail: 'closed' }));
    }
  },
  minimizeCurrentWindow: async () => {
    console.log('[Mock] 模拟最小化窗口');
  },
};  