import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Conversation, ConversationBase, Message, User, Contact } from '../types/types';
import { useMessageStore } from './message';
import { useAuth } from './auth';

// 会话状态接口
interface ConversationState {
  // 数据状态
  conversations: Conversation[];

  // 加载状态
  isLoading: boolean;
  error: string | null;

  // 方法
  setConversations: (conversations: Conversation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API 方法
  refreshConversations: () => Promise<void>;
  getConversationById: (id: string) => Conversation | undefined;
  createDirectConversation: (targetUserId: string) => Promise<string | null>;
}

// 转换后端数据为前端格式
const transformConversation = (backendConversation: ConversationBase, contacts: Contact[] = [], messages: Message[] = []): Conversation => {
  // 从后端数据中提取信息
  const conversationId = backendConversation.conversation_id;
  const conversationType = backendConversation.conversation_type;
  const meta = backendConversation.meta || {};
  const members = backendConversation.members || [];

  // 根据会话类型设置不同的默认值
  let name = meta.name || 'Unknown Conversation';
  let avatar = meta.avatar || 'https://randomuser.me/api/portraits/men/1.jpg';

  // 如果是群聊，使用群组头像和名称
  if (conversationType === 'group') {
    avatar = meta.avatar || 'https://cdn.dribbble.com/users/7179533/avatars/normal/f422e09d77e62217dc67c457f3cf1807.jpg';
    name = meta.name || `Group Chat (${members.length} members)`;
  } else {
    // 如果是私聊，尝试从联系人中获取对方信息
    if (members.length > 0) {
      // 找到对方的用户ID（假设第一个成员是对方）
      const otherUserId = members[0];
      if (otherUserId) {
        // 从联系人列表中查找对方信息
        const contact = contacts.find(c => c.target_id === otherUserId);
        if (contact) {
          name = contact.remark_name || name;
          // 使用默认头像，因为Contact类型没有avatar_url
          avatar = 'https://randomuser.me/api/portraits/women/2.jpg';
        }
      }
    }
  }

  // 转换参与者信息
  const participants: User[] = contacts
    .filter(contact => members.includes(contact.target_id))
    .map(contact => ({
      id: contact.target_id,
      name: contact.remark_name || 'Unknown User',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      status: 'offline' as 'online' | 'offline' | 'away' // 默认离线状态
    }));

  // 获取该会话的消息
  const conversationMessages = messages.filter(msg => 
    // 这里需要根据实际的消息数据结构来过滤
    // 暂时返回空数组，消息将通过 MessageStore 单独管理
    false
  );

  // 获取最后一条消息
  const lastMessage = conversationMessages.length > 0 
    ? conversationMessages[conversationMessages.length - 1]
    : undefined;

  // 计算未读消息数（暂时设为0，后续可以从后端获取）
  const unreadCount = 0;

  return {
    id: conversationId,
    name,
    avatar,
    type: conversationType as 'direct' | 'group',
    mentions: 0, // 暂时设为0，后续可以从消息中计算
    participants,
    lastMessage,
    messages: [], // 消息通过 MessageStore 单独管理
    unreadCount
  };
};

// 创建会话状态管理
export const useConversationStore = create<ConversationState>((set, get) => ({
  // 初始状态
  conversations: [],
  isLoading: false,
  error: null,

  // 设置会话列表
  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // 设置错误状态
  setError: (error: string | null) => {
    set({ error });
  },

  // 刷新会话列表
  refreshConversations: async () => {
    try {
      set({ isLoading: true, error: null });

      // 并行获取会话列表和联系人列表
      const [backendConversations, contacts] = await Promise.all([
        invoke('cmd_conversation_list_all') as Promise<ConversationBase[]>,
        invoke('cmd_contact_list_all') as Promise<Contact[]>
      ]);

      // 转换数据格式，传入联系人信息
      const transformedConversations = backendConversations.map(conv => 
        transformConversation(conv, contacts)
      );

      set({
        conversations: transformedConversations,
        isLoading: false
      });

      // Refreshed conversations
    } catch (error) {
      // Failed to refresh conversations
      set({
        error: error instanceof Error ? error.message : 'Failed to load conversations',
        isLoading: false
      });
    }
  },

  // 根据 ID 获取会话
  getConversationById: (id: string) => {
    const { conversations } = get();
    return conversations.find(conv => conv.id === id);
  },

  // 创建单聊会话
  createDirectConversation: async (targetUserId: string) => {
    try {
      // 调用后端API创建会话
      const result = await invoke('cmd_create_conversation', {
        conversationType: 'direct',
        members: [targetUserId],
      }) as { conversation_id: string };
      // 刷新会话列表
      await get().refreshConversations();
      return result.conversation_id;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create conversation' });
      return null;
    }
  },
})); 