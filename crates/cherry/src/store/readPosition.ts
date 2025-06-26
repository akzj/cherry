import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface ReadPositionState {
  // 每个会话的读取位置 conversationId -> lastReadMessageId
  readPositions: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  saveReadPosition: (conversationId: string, messageId: number) => Promise<void>;
  getReadPosition: (conversationId: string) => Promise<number | null>;
  setReadPosition: (conversationId: string, messageId: number) => void;
  clearError: () => void;
}

export const useReadPositionStore = create<ReadPositionState>((set, get) => ({
  readPositions: {},
  isLoading: false,
  error: null,

  saveReadPosition: async (conversationId: string, messageId: number) => {
    try {
      set({ isLoading: true, error: null });
      
      // 调用后端API保存读取位置
      await invoke('cmd_save_read_position', {
        conversationId,
        lastReadMessageId: messageId
      });
      
      // 更新本地状态
      set((state) => ({
        readPositions: {
          ...state.readPositions,
          [conversationId]: messageId
        },
        isLoading: false
      }));
      
      console.log(`Saved read position for conversation ${conversationId}: message ${messageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save read position';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      console.error('Failed to save read position:', error);
    }
  },

  getReadPosition: async (conversationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // 先检查本地缓存
      const localPosition = get().readPositions[conversationId];
      if (localPosition !== undefined) {
        set({ isLoading: false });
        return localPosition;
      }
      
      // 调用后端API获取读取位置
      const position = await invoke('cmd_get_read_position', {
        conversationId
      }) as number | null;
      
      // 更新本地状态
      if (position !== null) {
        set((state) => ({
          readPositions: {
            ...state.readPositions,
            [conversationId]: position
          },
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
      
      console.log(`Got read position for conversation ${conversationId}: ${position}`);
      return position;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get read position';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      console.error('Failed to get read position:', error);
      return null;
    }
  },

  setReadPosition: (conversationId: string, messageId: number) => {
    set((state) => ({
      readPositions: {
        ...state.readPositions,
        [conversationId]: messageId
      }
    }));
  },

  clearError: () => set({ error: null })
})); 