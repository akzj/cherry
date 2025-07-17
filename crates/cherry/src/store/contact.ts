import { create } from 'zustand';
import { contactService } from '@/services/contactService';
import { Contact, Group } from '@/types';

// 联系人状态接口
interface ContactState {
  // 数据状态
  contacts: Contact[];
  ownedGroups: Group[];
  joinedGroups: Group[];
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 搜索状态
  searchQuery: string;
  
  // 方法
  setContacts: (contacts: Contact[]) => void;
  setOwnedGroups: (groups: Group[]) => void;
  setJoinedGroups: (groups: Group[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // API 方法
  refreshContacts: () => Promise<void>;
  refreshGroups: () => Promise<void>;
  searchContacts: (query: string) => Promise<void>;
  createGroup: (groupData: Partial<Group>) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
}

// 创建联系人 store
export const useContactStore = create<ContactState>((set, get) => ({
  // 初始状态
  contacts: [],
  ownedGroups: [],
  joinedGroups: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  
  // 设置方法
  setContacts: (contacts) => set({ contacts }),
  setOwnedGroups: (ownedGroups) => set({ ownedGroups }),
  setJoinedGroups: (joinedGroups) => set({ joinedGroups }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  // API 方法
  refreshContacts: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // 获取联系人列表
      const contacts = await contactService.listAll();
      
      // 按名字排序联系人
      const sortedContacts = contacts.sort((a, b) => 
        (a.remark_name || '').localeCompare(b.remark_name || '') || 0
      );
      
      set({ 
        contacts: sortedContacts, 
        isLoading: false 
      });
    } catch (error) {
      // Failed to refresh contacts
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load contacts',
        isLoading: false 
      });
    }
  },
  
  refreshGroups: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // 获取我创建的群组
      const ownedGroups = await contactService.listOwnedGroups();
      
      // 获取我加入的群组
      const joinedGroups = await contactService.listJoinedGroups();
      
      set({ 
        ownedGroups, 
        joinedGroups,
        isLoading: false 
      });
    } catch (error) {
      // Failed to refresh groups
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load groups',
        isLoading: false 
      });
    }
  },
  
  searchContacts: async (query: string) => {
    try {
      set({ isLoading: true, error: null, searchQuery: query });
      
      if (!query.trim()) {
        // 如果搜索查询为空，重新加载所有联系人
        await get().refreshContacts();
        return;
      }
      
      // 搜索联系人
      const searchResults = await contactService.search(query);
      
      // 按名字排序搜索结果
      const sortedResults = searchResults.sort((a, b) => 
        (a.remark_name || '').localeCompare(b.remark_name || '') || 0
      );
      
      set({ 
        contacts: sortedResults, 
        isLoading: false 
      });
    } catch (error) {
      // Failed to search contacts
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search contacts',
        isLoading: false 
      });
    }
  },
  
  createGroup: async (groupData: Partial<Group>) => {
    try {
      set({ isLoading: true, error: null });
      
      const newGroup = await contactService.createGroup(groupData);
      
      // 更新创建的群组列表
      const currentOwnedGroups = get().ownedGroups;
      set({ 
        ownedGroups: [...currentOwnedGroups, newGroup],
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to create group:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create group',
        isLoading: false 
      });
    }
  },
  
  joinGroup: async (groupId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await contactService.joinGroup(groupId);
      
      // 重新加载群组数据
      await get().refreshGroups();
    } catch (error) {
      console.error('Failed to join group:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join group',
        isLoading: false 
      });
    }
  },
  
  leaveGroup: async (groupId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await contactService.leaveGroup(groupId);
      
      // 重新加载群组数据
      await get().refreshGroups();
    } catch (error) {
      console.error('Failed to leave group:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to leave group',
        isLoading: false 
      });
    }
  },
}));