// src/services/fileService/tauriImpl.ts
import { path } from '@tauri-apps/api';
import { appCacheDir } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import type { FileService, FileUploadCompleteResponse, FileInfo } from './types';

export const tauriFileService: FileService = {
  uploadFile: async (conversationId, filePath) => {
    return await invoke<FileUploadCompleteResponse>('cmd_upload_file', { conversationId, filePath });
  },
  getCacheDirPath: async () => {
    return await appCacheDir();
  },
  exists: async (filePath) => {
    return await exists(filePath);
  },
  downloadFile: async (url, cachePath) => {
    return await invoke('cmd_download_file', { url, filePath: cachePath });
  },
  toAccessibleUrl: (filePath) => {
    return `cherry://localhost?file_path=${filePath}`;
  },
  getFileInfo: async (filePath) => {
    return await invoke<FileInfo>('cmd_get_file_info', { filePath });
  }
};