import type { DialogService } from './types';

export const mockDialogService: DialogService = {
  async openImageDialog() {
    return new Promise<string | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            console.log(file)
          // 返回本地文件路径或DataURL
          const localUrl = URL.createObjectURL(file);
          console.log('Selected file:', localUrl);
          resolve(localUrl);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }
};
