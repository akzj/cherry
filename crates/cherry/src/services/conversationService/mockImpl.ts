import type { ConversationService } from './types';
import type { ConversationBase, Contact } from '@/types';

export const mockConversationService: ConversationService = {
  listAllConversations: async () => {
    return [];
  },
  listAllContacts: async () => {
    return [];
  },
  createConversation: async (targetUserId) => {
    return { conversation_id: 'mock-conv-' + targetUserId };
  }
}; 