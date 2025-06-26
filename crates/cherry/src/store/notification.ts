import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Contact, Conversation } from '../types/types';

// 通知类型
export type NotificationType = 'contacts_updated' | 'conversations_updated' | 'new_message' | 'user_status_changed';

// 通知数据接口
export interface NotificationData {
  type: NotificationType;
  data?: any;
  timestamp: number;
}

// 通知状态接口
interface NotificationState {
  // 状态
  notifications: NotificationData[];
  isConnected: boolean;
  
  // 数据缓存
  contacts: Contact[];
  conversations: Conversation[];
  
  // 方法
  addNotification: (notification: NotificationData) => void;
  clearNotifications: () => void;
  updateContacts: (contacts: Contact[]) => void;
  updateConversations: (conversations: Conversation[]) => void;
  setConnectionStatus: (status: boolean) => void;
  refreshContacts: () => Promise<void>;
  refreshConversations: () => Promise<void>;
}

// 创建通知状态管理
export const useNotificationStore = create<NotificationState>((set, get) => {
  let timestampCounter = 0;
  
  const getUniqueTimestamp = () => {
    timestampCounter += 1;
    return Date.now() + timestampCounter;
  };

  return {
    // 初始状态
    notifications: [],
    isConnected: false,
    contacts: [],
    conversations: [],

    // 添加通知
    addNotification: (notification: NotificationData) => {
      set((state) => ({
        notifications: [...state.notifications, notification].slice(-50), // 保留最近50条
      }));
    },

    // 清除通知
    clearNotifications: () => {
      set({ notifications: [] });
    },

    // 更新联系人列表
    updateContacts: (contacts: Contact[]) => {
      set({ contacts });
      get().addNotification({
        type: 'contacts_updated',
        data: { count: contacts.length },
        timestamp: getUniqueTimestamp(),
      });
    },

    // 更新会话列表
    updateConversations: (conversations: Conversation[]) => {
      set({ conversations });
      get().addNotification({
        type: 'conversations_updated',
        data: { count: conversations.length },
        timestamp: getUniqueTimestamp(),
      });
    },

    // 设置连接状态
    setConnectionStatus: (status: boolean) => {
      set({ isConnected: status });
    },

    // 刷新联系人列表
    refreshContacts: async () => {
      try {
        const contacts = await invoke('cmd_contact_list_all') as Contact[];
        get().updateContacts(contacts);
      } catch (error) {
        console.error('Failed to refresh contacts:', error);
      }
    },

    // 刷新会话列表
    refreshConversations: async () => {
      try {
        const conversations = await invoke('cmd_conversation_list_all') as Conversation[];
        get().updateConversations(conversations);
      } catch (error) {
        console.error('Failed to refresh conversations:', error);
      }
    },
  };
});

// 导出便捷的hooks
export const useNotifications = () => {
  const store = useNotificationStore();
  
  return {
    ...store,
    // 便捷的getter
    recentNotifications: store.notifications.slice(-5), // 最近5条通知
    hasNewNotifications: store.notifications.length > 0,
  };
}; 