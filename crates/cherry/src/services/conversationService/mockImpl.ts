import type { ConversationService } from './types';
import type { ConversationBase } from '@/types/models/conversation';
import type { Contact } from '@/types/models/contact';
import { conversationDb, defaultConversationDb, initializeConversationDb } from './data/db';

// 确保只初始化一次
let isInitialized = false;

const initOnce = async () => {
  if (!isInitialized) {
    await initializeConversationDb();
    isInitialized = true;
  }
};

export const mockConversationService: ConversationService = {
  listAllConversations: async (): Promise<ConversationBase[]> => {
    await initOnce();
    const data = await conversationDb.read();
    return data?.conversations || [];
  },

  listAllContacts: async (): Promise<Contact[]> => {
    await initOnce();
    const data = await conversationDb.read();
    return data?.contacts || [];
  },

  createConversation: async (targetUserId: string): Promise<{ conversation_id: string }> => {
    await initOnce();
    const data = await conversationDb.read() || defaultConversationDb;
    
    // 检查是否已存在对话
    const existingConv = data.conversations.find(conv => 
      conv.conversation_type === 'direct' && 
      conv.members.includes('mock-user-id') && 
      conv.members.includes(targetUserId)
    );
    
    if (existingConv) {
      return { conversation_id: existingConv.conversation_id };
    }
    
    // 创建新对话
    const newConversation: ConversationBase = {
      conversation_id: `conv-${targetUserId}-${Date.now()}`,
      conversation_type: 'direct',
      members: ['mock-user-id', targetUserId],
      meta: {
        name: `与 ${targetUserId} 的对话`,
        description: `与 ${targetUserId} 的私聊对话`,
        avatar: `https://i.pravatar.cc/150?u=${targetUserId}`
      },
      stream_id: data.conversations.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.conversations.push(newConversation);
    await conversationDb.write(data);
    
    return { conversation_id: newConversation.conversation_id };
  }
}; 