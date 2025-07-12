// src/services/fileService/tauriImpl.ts
import { path } from '@tauri-apps/api';
import { appCacheDir } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';

import type { FileService } from './types';

// Tauri 环境的实现：调用真实 Tauri API
export const tauriFileService: FileService = {
  getCacheDirPath: async () => {
    return await appCacheDir(); // Tauri 提供的缓存目录
  },
  exists: async (filePath) => {
    return await exists(filePath); // Tauri 的文件存在检查
  },
  downloadFile: async (url, cachePath) => {
    // 调用 Tauri 的下载命令（原组件的 invoke 逻辑）
    return await invoke('cmd_download_file', { url, filePath: cachePath });
  },
  toAccessibleUrl: (filePath) => {
    // Tauri 自定义协议，用于访问本地文件
    return `cherry://localhost?file_path=${filePath}`;
  },
};