import { isTauriEnv } from '@/utils';
import { tauriContactService } from './tauriImpl';
import { mockContactService } from './mockImpl';
export * from './types';

export const contactService = isTauriEnv ? tauriContactService : mockContactService; 