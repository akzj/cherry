import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Conversation, ConversationBase, Message, User } from '../types/types';

// Mock 消息数据（暂时保留）
const mockMessages: Message[] = [
  {
    id: 'msg1',
    userId: 'user2',
    content: 'Hey, how are you doing?',
    timestamp: '2023-05-15T10:30:00Z'
  },
  {
    id: 'msg2',
    userId: 'user1',
    content: "I'm good, thanks! How about you?",
    timestamp: '2023-05-15T10:32:00Z',
    isOwn: true,
    status: 'read'
  },
  {
    id: 'msg3',
    userId: 'user2',
    content: "I'm doing great! Just finished that project we were talking about.",
    timestamp: '2023-05-15T10:33:00Z'
  },
  {
    id: 'msg4',
    userId: 'user1',
    content: "That's awesome! Can you share some screenshots?",
    timestamp: '2023-05-15T10:35:00Z',
    isOwn: true,
    status: 'read'
  },
  {
    id: 'msg5',
    userId: 'user2',
    content: "Sure, I'll send them over shortly.",
    timestamp: '2023-05-15T10:36:00Z'
  }
];

// Mock 用户数据（暂时保留）
const mockUsers: User[] = [
  {
    id: 'user2',
    name: 'Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    status: 'online'
  },
  {
    id: 'user3',
    name: 'Alex Johnson',
    avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
    status: 'away'
  },
  {
    id: 'user4',
    name: 'Sarah Williams',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    status: 'offline'
  }
];

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
}

// 转换后端数据为前端格式
const transformConversation = (backendConversation: ConversationBase): Conversation => {
  // 从后端数据中提取信息
  const conversationId = backendConversation.conversation_id;
  const conversationType = backendConversation.conversation_type;
  const meta = backendConversation.meta || {};
  
  // 根据会话类型设置不同的默认值
  let name = meta.name || 'Unknown Conversation';
  let avatar = meta.avatar || 'https://randomuser.me/api/portraits/men/1.jpg';
  
  // 如果是群聊，使用群组头像和名称
  if (conversationType === 'group') {
    avatar = meta.avatar || 'https://cdn.dribbble.com/users/7179533/avatars/normal/f422e09d77e62217dc67c457f3cf1807.jpg';
  } else {
    // 如果是私聊，使用默认用户头像
    avatar = 'https://randomuser.me/api/portraits/women/2.jpg';
  }
  
  // 生成 mock 的最后一条消息
  const lastMessage: Message = {
    id: `msg_${conversationId}_last`,
    userId: 'user2',
    content: conversationType === 'group' ? 'Meeting at 3pm tomorrow' : 'Hey, how are you doing?',
    timestamp: new Date().toISOString()
  };
  
  return {
    id: conversationId,
    name,
    avatar,
    type: conversationType as 'direct' | 'group',
    mentions: Math.floor(Math.random() * 3), // Mock 数据
    participants: mockUsers, // Mock 数据
    lastMessage,
    messages: mockMessages, // Mock 数据
    unreadCount: Math.floor(Math.random() * 5) // Mock 数据
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
      
      // 调用后端 API 获取会话列表
      const backendConversations = await invoke('cmd_conversation_list_all') as any[];
      
      // 转换数据格式
      const transformedConversations = backendConversations.map(transformConversation);
      
      set({ 
        conversations: transformedConversations,
        isLoading: false 
      });
      
      console.log('Refreshed conversations:', transformedConversations);
    } catch (error) {
      console.error('Failed to refresh conversations:', error);
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
  }
})); 