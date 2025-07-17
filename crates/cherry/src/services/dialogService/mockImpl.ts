import type { DialogService, FileInfo } from './types';

export const mockDialogService: DialogService = {
  async openImageDialog() {
    return new Promise<FileInfo | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log(file);
          // 返回本地文件路径或DataURL
          const localUrl = URL.createObjectURL(file);
          console.log('Selected file:', localUrl);
          
          resolve({
            path: localUrl,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            lastModifiedDate: new Date(file.lastModified)
          });
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  },

  async openFileDialog() {
    return new Promise<FileInfo | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*'; // 接受所有文件类型
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log('Selected file:', file);
          // 返回本地文件路径或DataURL
          const localUrl = URL.createObjectURL(file);
          console.log('Selected file URL:', localUrl);
          
          resolve({
            path: localUrl,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            lastModifiedDate: new Date(file.lastModified)
          });
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }
};
