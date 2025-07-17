import { open } from '@tauri-apps/plugin-dialog';
import type { DialogService } from './types';

export const tauriDialogService: DialogService = {
  async openImageDialog() {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
    });
    return typeof selected === 'string' ? selected : null;
  },

  async openFileDialog() {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'All Files', extensions: ['*'] }]
    });
    return typeof selected === 'string' ? selected : null;
  }
};
