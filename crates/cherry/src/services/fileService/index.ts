
import { isTauriEnv } from '@/utils';
import { tauriFileService } from './tauriImpl';
import { mockFileService } from './mockImpl';
export * from './types';

export const fileService = isTauriEnv ? tauriFileService : mockFileService;

