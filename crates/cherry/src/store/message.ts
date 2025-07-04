import { create } from 'zustand';
import { Message, buildReplyRelations } from '../types/types';

export interface MessageState {
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMessage: (conversationId: string, message: Message) => void;
  addMessages: (conversationId: string, messages: Message[]) => void;
  updateMessage: (conversationId: string, messageId: number, updates: Partial<Message> | ((msg: Message) => Partial<Message>)) => void;
  clearMessages: (conversationId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getMessages: (conversationId: string) => Message[];
  getMessageById: (conversationId: string, messageId: number) => Message | undefined;
  
  mergeReactionToMessage: (conversationId: string, messageId: number, reaction: { emoji: string, users: string, action: 'add' | 'remove' }) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: false,
  error: null,

  addMessage: (conversationId: string, message: Message) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId] || [];
      const updatedMessages = [...conversationMessages, message];
      
      // Adding message to conversation
      
      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedMessages,
        },
      };
    });
  },

  addMessages: (conversationId: string, messages: Message[]) => {
    // 先建立 reply 关系
    buildReplyRelations(messages);
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

  updateMessage: (conversationId: string, messageId: number, updates: Partial<Message> | ((msg: Message) => Partial<Message>)) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId] || [];
      const updatedMessages = conversationMessages.map((msg) => {
        if (msg.id !== messageId) return msg;
        if (typeof updates === 'function') {
          return { ...msg, ...updates(msg) };
        } else {
          return { ...msg, ...updates };
        }
      });
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
    const messages = get().messages[conversationId] || [];
    // Getting messages for conversation
    return messages;
  },

  getMessageById: (conversationId: string, messageId: number) => {
    const messages = get().messages[conversationId] || [];
    return messages.find((msg) => msg.id === messageId);
  },


  // 合并 reaction 到目标消息
  mergeReactionToMessage: (conversationId: string, messageId: number, reaction: { emoji: string, users: string, action: 'add' | 'remove' }) => {
    get().updateMessage(conversationId, messageId, (msg) => {
      let reactions = msg.reactions ? [...msg.reactions] : [];
      const idx = reactions.findIndex(r => r.emoji === reaction.emoji);
      if (reaction.action === 'add') {
        if (idx >= 0) {
          if (!reactions[idx].users.includes(reaction.users)) {
            reactions[idx] = { ...reactions[idx], users: [...reactions[idx].users, reaction.users] };
          }
        } else {
          reactions.push({ emoji: reaction.emoji, users: [reaction.users] });
        }
      } else if (reaction.action === 'remove') {
        if (idx >= 0) {
          reactions[idx] = { ...reactions[idx], users: reactions[idx].users.filter(u => u !== reaction.users) };
          if (reactions[idx].users.length === 0) {
            reactions.splice(idx, 1);
          }
        }
      }
      return { reactions };
    });
  },
}));