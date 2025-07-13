import { isTauriEnv } from '@/utils';
import { tauriConversationService } from './tauriImpl';
import { mockConversationService } from './mockImpl';
export * from './types';

export const conversationService = isTauriEnv ? tauriConversationService : mockConversationService; 