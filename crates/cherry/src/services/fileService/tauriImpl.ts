import { appCacheDir } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import type { FileService, FileUploadCompleteResponse, FileInfo } from './types';

export const tauriFileService: FileService = {
  uploadFile: async (conversationId, filePath) => {
    return await invoke<FileUploadCompleteResponse>('cmd_upload_file', { conversationId, filePath });
  },
  downloadFile: async (url) => {
    const cachePath = await appCacheDir();
    // 自动处理缓存路径和exist检查
    let finalCachePath = cachePath;
    if (!finalCachePath) {
      const cacheDir = await appCacheDir();
      finalCachePath = `${cacheDir}/${url.split('/').pop()}`;
    }
    const alreadyExists = await exists(finalCachePath);
    if (alreadyExists) {
      return finalCachePath;
    }
    // 下载并缓存
    return await invoke('cmd_download_file', { url, filePath: finalCachePath });
  },
  toAccessibleUrl: (filePath) => {
    return `cherry://localhost?file_path=${filePath}`;
  },
  getFileInfo: async (filePath) => {
    return await invoke<FileInfo>('cmd_get_file_info', { filePath });
  }
};