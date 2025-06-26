import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Message } from '../types/types';

export interface MessageState {
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: boolean;
  error: string | null;
  replyingTo: Message | null; // 当前正在回复的消息
  
  // Actions
  addMessage: (conversationId: string, message: Message) => void;
  addMessages: (conversationId: string, messages: Message[]) => void;
  updateMessage: (conversationId: string, messageId: number, updates: Partial<Message>) => void;
  clearMessages: (conversationId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getMessages: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, content: string, messageType?: string, replyTo?: number) => Promise<void>;
  
  // 回复相关方法
  setReplyingTo: (message: Message | null) => void;
  getMessageById: (conversationId: string, messageId: number) => Message | undefined;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: false,
  error: null,
  replyingTo: null,

  addMessage: (conversationId: string, message: Message) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId] || [];
      const updatedMessages = [...conversationMessages, message];
      
      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedMessages,
        },
      };
    });
  },

  addMessages: (conversationId: string, messages: Message[]) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId] || [];
      const updatedMessages = [...conversationMessages, ...messages];
      
      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedMessages,
        },
      };
    });
  },

  updateMessage: (conversationId: string, messageId: number, updates: Partial<Message>) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId] || [];
      const updatedMessages = conversationMessages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      
      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedMessages,
        },
      };
    });
  },

  clearMessages: (conversationId: string) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [],
      },
    }));
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),

  getMessages: (conversationId: string) => {
    return get().messages[conversationId] || [];
  },

  sendMessage: async (conversationId: string, content: string, messageType?: string, replyTo?: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // 调用后端 API 发送消息
      await invoke('cmd_send_message', {
        conversationId,
        content,
        messageType: messageType || 'text',
        replyTo
      });
      
      // 发送成功后，可以添加一个临时消息到本地状态
      // 实际的消息会通过消息接收机制从后端获取
      const tempMessage: Message = {
        id: Date.now(), // 临时ID
        userId: 'current_user', // 临时用户ID
        content,
        timestamp: new Date().toISOString(),
        type: (messageType || 'text') as Message['type']
      };
      
      // 添加到本地消息列表
      const state = get();
      const conversationMessages = state.messages[conversationId] || [];
      const updatedMessages = [...conversationMessages, tempMessage];
      
      set({
        messages: {
          ...state.messages,
          [conversationId]: updatedMessages,
        },
        isLoading: false,
      });
      
    } catch (error) {
      let errorMessage = 'Failed to send message';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  },

  setReplyingTo: (message: Message | null) => set({ replyingTo: message }),

  getMessageById: (conversationId: string, messageId: number) => {
    const messages = get().messages[conversationId] || [];
    return messages.find((msg) => msg.id === messageId);
  },
}));