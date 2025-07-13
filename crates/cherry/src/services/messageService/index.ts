import { isTauriEnv } from '@/utils';
import { tauriMessageService } from './tauriImpl';
import { mockMessageService } from './mockImpl';
export * from './types';

export const messageService = isTauriEnv ? tauriMessageService : mockMessageService; 