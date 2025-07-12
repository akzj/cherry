
import type { FileService } from './types';
import { tauriFileService } from './tauriImpl';
import { mockFileService } from './mockImpl';
import { isTauriEnv } from '@/utils';

// 环境判断：是否在 Tauri 环境（可抽为工具函数）


// 选择服务实现（Tauri 环境用真实服务，否则用 mock）
const fileService: FileService = isTauriEnv ? tauriFileService : mockFileService;

export { fileService }

