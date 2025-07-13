// src/services/fileService/mockImpl.ts（增强版）
import type { FileService, FileUploadCompleteResponse, FileInfo } from './types';

// 全局变量存储 mock 配置（可被 Storybook 参数修改）
let mockConfig = { delay: 1000, shouldFail: false };

export const setMockConfig = (config: Partial<typeof mockConfig>) => {
  mockConfig = { ...mockConfig, ...config };
};

export const mockFileService: FileService = {
  uploadFile: async (conversationId, filePath) => {
    await new Promise(res => setTimeout(res, 200));
    return {
      file_url: 'https://mock.cdn/image.png',
      file_thumbnail_url: 'https://mock.cdn/thumb.png',
      file_metadata: { mock: true }
    };
  },
  getCacheDirPath: async () => {
    return '/mock/cache/dir';
  },
  exists: async (filePath) => {
    // 简单模拟：所有文件都不存在
    return false;
  },
  downloadFile: async (url, cachePath) => {
    // 直接返回 cachePath，模拟“下载”成功
    return cachePath;
  },
  getFileInfo: async (filePath) => {
    return {
      name: filePath.split('/').pop() || 'image',
      size: 123456
    };
  },
  toAccessibleUrl: (filePath) => {
    // 直接返回 filePath 或拼接 mock 协议
    return `mock://${filePath}`;
  }
};