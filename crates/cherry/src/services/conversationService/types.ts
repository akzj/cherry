import type { ConversationBase } from '@/types';
import type { Contact } from '@/types';

export interface ConversationService {
  listAllConversations(): Promise<ConversationBase[]>;
  listAllContacts(): Promise<Contact[]>;
  createConversation(targetUserId: string): Promise<{ conversation_id: string }>;
} 