// src/services/fileService/mockImpl.ts（增强版）
import type { FileService, FileInfo } from './types';
import { LocalDbAdapter } from '../mock/LocalDbAdapter';

// 全局变量存储 mock 配置（可被 Storybook 参数修改）

// Blob序列化/反序列化工具
function simpleHash(str: string): string {
  // 简单hash算法，避免依赖node crypto
  let hash = 0, i, chr;
  if (str.length === 0) return hash.toString();
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString();
}
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string): Blob {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const imageDb = new LocalDbAdapter<Record<string, { blobBase64: string; info: FileInfo }>>('mock_images');
let mockConfig = { delay: 1000, shouldFail: false };

export const setMockConfig = (config: Partial<typeof mockConfig>) => {
  mockConfig = { ...mockConfig, ...config };
};

export const mockFileService: FileService = {
  uploadFile: async (conversationId, filePath) => {
    await new Promise(res => setTimeout(res, 200));
    let blob: Blob = new Blob([], { type: 'image/png' });
    let info: FileInfo = { name: 'image', size: 0 };
    if (filePath.startsWith('blob:')) {
      try {
        const res = await fetch(filePath);
        const fetchedBlob = await res.blob();
        if (fetchedBlob instanceof Blob) {
          blob = fetchedBlob;
        }
        info = { name: filePath, size: blob.size };
      } catch {
        // fetch失败，blob保持为空Blob
        info = { name: filePath, size: 0 };
      }
    } else {
      // 模拟本地文件，实际项目可扩展
      blob = new Blob(['mock'], { type: 'image/png' });
      info = { name: filePath.split('/').pop() || 'image', size: blob.size };
    }
    // 生成唯一ID
    const id = `${conversationId}_${Date.now()}`;
    // Blob转base64
    const blobBase64 = await blobToBase64(blob);
    const hash = simpleHash(blobBase64);
    // 检查是否已存在相同hash
    const db = (await imageDb.read()) || {};
    let existingId = Object.keys(db).find(key => {
      const entry = db[key];
      if (!entry || typeof entry.blobBase64 !== 'string') return false;
      return simpleHash(entry.blobBase64) === hash;
    });
    let finalId = existingId || `${conversationId}_${Date.now()}`;
    if (!existingId) {
      db[finalId] = { blobBase64, info };
      await imageDb.write(db);
    }
    console.log('Mock file uploaded skip store repeated file :', finalId, info);
    const file_url = `mock-img://${finalId}`;
    return {
      file_url,
      file_thumbnail_url: file_url,
      file_metadata: info
    };
  },
  downloadFile: async (url) => {
    // url格式: mock-img://id
    if (url.startsWith('mock-img://')) {
      const id = url.replace('mock-img://', '');
      const db = (await imageDb.read()) || {};
      const entry = db[id];
      if (entry && entry.blobBase64) {
        const blob = base64ToBlob(entry.blobBase64);
        return URL.createObjectURL(blob);
      } else {
        console.warn(`Mock file not found or invalid for ID: ${id}`);
        return url;
      }
    }
    // 其他情况返回原url
    return url;
  },
  getFileInfo: async (filePath) => {
    // 兼容 blob:http://localhost/...
    if (filePath.startsWith('blob:')) {
      try {
        const res = await fetch(filePath);
        const blob = await res.blob();
        return {
          name: filePath,
          size: blob.size
        };
      } catch {
        return {
          name: 'image',
          size: 0
        };
      }
    }
    return {
      name: filePath.split('/').pop() || 'image',
      size: 123456
    };
  },
  toAccessibleUrl: (filePath) => {
    return filePath
  }
};