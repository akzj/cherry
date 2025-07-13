import { invoke } from '@tauri-apps/api/core';
import type { ConversationService } from './types';
import type { ConversationBase, Contact } from '@/types';

export const tauriConversationService: ConversationService = {
  listAllConversations: async () => {
    return await invoke<ConversationBase[]>('cmd_conversation_list_all');
  },
  listAllContacts: async () => {
    return await invoke<Contact[]>('cmd_contact_list_all');
  },
  createConversation: async (targetUserId) => {
    return await invoke<{ conversation_id: string }>('cmd_create_conversation', {
      conversationType: 'direct',
      members: [targetUserId],
    });
  }
}; 