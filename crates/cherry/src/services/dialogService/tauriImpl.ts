import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import type { DialogService, FileInfo } from './types';

export const tauriDialogService: DialogService = {
  async openImageDialog() {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
    });
    
    if (typeof selected === 'string') {
      try {
        // 通过 Rust 后端获取文件信息
        const fileInfo: any = await invoke('get_file_info', { path: selected });
        return {
          path: selected,
          name: fileInfo.name || selected.split('/').pop() || selected,
          size: fileInfo.size || 0,
          type: fileInfo.type || 'image/*',
          lastModified: fileInfo.lastModified || Date.now(),
          lastModifiedDate: new Date(fileInfo.lastModified || Date.now())
        };
      } catch (error) {
        console.error('Failed to get file info:', error);
        // 降级处理：返回基本信息
        return {
          path: selected,
          name: selected.split('/').pop() || selected,
          size: 0,
          type: 'image/*',
          lastModified: Date.now(),
          lastModifiedDate: new Date()
        };
      }
    }
    
    return null;
  },

  async openFileDialog() {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'All Files', extensions: ['*'] }]
    });
    
    if (typeof selected === 'string') {
      try {
        // 通过 Rust 后端获取文件信息
        const fileInfo: any = await invoke('get_file_info', { path: selected });
        return {
          path: selected,
          name: fileInfo.name || selected.split('/').pop() || selected,
          size: fileInfo.size || 0,
          type: fileInfo.type || 'application/octet-stream',
          lastModified: fileInfo.lastModified || Date.now(),
          lastModifiedDate: new Date(fileInfo.lastModified || Date.now())
        };
      } catch (error) {
        console.error('Failed to get file info:', error);
        // 降级处理：返回基本信息
        return {
          path: selected,
          name: selected.split('/').pop() || selected,
          size: 0,
          type: 'application/octet-stream',
          lastModified: Date.now(),
          lastModifiedDate: new Date()
        };
      }
    }
    
    return null;
  }
};
