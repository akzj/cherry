import { create } from 'zustand';
import { Message } from '../types/types';

export interface MessageState {
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMessage: (conversationId: string, message: Message) => void;
  addMessages: (conversationId: string, messages: Message[]) => void;
  updateMessage: (conversationId: string, messageId: number, updates: Partial<Message>) => void;
  clearMessages: (conversationId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getMessages: (conversationId: string) => Message[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: false,
  error: null,

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
}));