import { create } from 'zustand';
import { contactService } from '@/services/contactService';
import { Contact, ContactGroup, Group } from '@/types';

// 联系人状态接口
interface ContactState {
  // 数据状态
  contacts: Contact[];
  contactGroups: ContactGroup[];
  ownedGroups: Group[];
  joinedGroups: Group[];
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 搜索状态
  searchQuery: string;
  
  // 方法
  setContacts: (contacts: Contact[]) => void;
  setContactGroups: (groups: ContactGroup[]) => void;
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
  contactGroups: [],
  ownedGroups: [],
  joinedGroups: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  
  // 设置方法
  setContacts: (contacts) => set({ contacts }),
  setContactGroups: (contactGroups) => set({ contactGroups }),
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
      
      // 将联系人按字母分组
      const contactGroups = groupContactsByLetter(contacts);
      
      set({ 
        contacts, 
        contactGroups,
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
      
      // 将搜索结果按字母分组
      const contactGroups = groupContactsByLetter(searchResults);
      
      set({ 
        contacts: searchResults, 
        contactGroups,
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

// 辅助函数：按字母分组联系人
function groupContactsByLetter(contacts: Contact[]): ContactGroup[] {
  const groups: { [key: string]: Contact[] } = {};
  
  contacts.forEach(contact => {
    const firstLetter = contact.remark_name?.charAt(0).toUpperCase() || '#';
    const groupKey = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(contact);
  });
  
  // 转换为数组格式并排序
  return Object.keys(groups)
    .sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    })
    .map(letter => ({
      id: letter,
      title: letter,
      contacts: groups[letter].sort((a, b) => (a.remark_name || '').localeCompare(b.remark_name || '') || 0)
    }));
} 