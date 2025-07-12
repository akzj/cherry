// src/services/fileService/mockImpl.ts（增强版）
import type { FileService } from './types';

// 全局变量存储 mock 配置（可被 Storybook 参数修改）
let mockConfig = { delay: 1000, shouldFail: false };

export const setMockConfig = (config: Partial<typeof mockConfig>) => {
  mockConfig = { ...mockConfig, ...config };
};

export const mockFileService: FileService = {
  getCacheDirPath: async () => 'mock-cache-dir',
  exists: async (cachePath) => {
    const cachedFiles = JSON.parse(localStorage.getItem('mock-cached-files') || '[]');
    return cachedFiles.includes(cachePath);
  },
  downloadFile: async (url, cachePath) => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, mockConfig.delay));
    
    // 模拟失败
    if (mockConfig.shouldFail) {
      throw new Error('模拟下载失败');
    }

    // 生成 mock 图片 URL（用原始 url 的 seed 保持图片一致性）
    const seed = url.split('seed/')[1]?.split('/')[0] || 'default';
    const mockImageUrl = `https://picsum.photos/seed/${seed}/200/200`;

    // 更新缓存
    const cachedFiles = JSON.parse(localStorage.getItem('mock-cached-files') || '[]');
    if (!cachedFiles.includes(cachePath)) {
      cachedFiles.push(cachePath);
      localStorage.setItem('mock-cached-files', JSON.stringify(cachedFiles));
    }

    return mockImageUrl;
  },
  toAccessibleUrl: (filePath) => filePath,
};