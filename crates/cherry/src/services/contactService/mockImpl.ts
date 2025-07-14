import type { ContactService } from './types';
import type { Contact } from '@/types';
import type { Group } from '@/types';
import { contactDb, defaultContactDb, initializeContactDb } from './data/db';

// 确保只初始化一次
let isInitialized = false;

const initOnce = async () => {
  if (!isInitialized) {
    await initializeContactDb();
    isInitialized = true;
  }
};

export const mockContactService: ContactService = {
  listAllContacts: async (): Promise<Contact[]> => {
    await initOnce();
    const data = await contactDb.read();
    return data?.contacts || [];
  },

  listAll: async (): Promise<Contact[]> => {
    await initOnce();
    const data = await contactDb.read();
    return data?.contacts || [];
  },

  listOwnedGroups: async (): Promise<Group[]> => {
    await initOnce();
    const data = await contactDb.read();
    return data?.groups.filter(g => g.isOwner) || [];
  },

  listJoinedGroups: async (): Promise<Group[]> => {
    await initOnce();
    const data = await contactDb.read();
    return data?.groups.filter(g => !g.isOwner) || [];
  },

  search: async (query: string): Promise<Contact[]> => {
    await initOnce();
    const data = await contactDb.read();
    if (!data) return [];
    const q = query.toLowerCase();
    return data.contacts.filter(c =>
      (c.remark_name?.toLowerCase().includes(q) ||
        c.contact_id.toLowerCase().includes(q) ||
        c.target_id.toLowerCase().includes(q))
    );
  },

  createGroup: async (groupData: any): Promise<Group> => {
    await initOnce();
    const data = await contactDb.read() || defaultContactDb;
    const newGroup: Group = {
      id: `group_${Date.now()}`,
      name: groupData.name || '新群组',
      avatar: groupData.avatar || '',
      memberCount: 1,
      isOwner: true,
    };
    data.groups.push(newGroup);
    await contactDb.write(data);
    return newGroup;
  },

  joinGroup: async (groupId: string): Promise<void> => {
    await initOnce();
    const data = await contactDb.read() || defaultContactDb;
    const group = data.groups.find(g => g.id === groupId);
    if (group && !group.isOwner) return;
    if (group) {
      return;
    }
    const joinedGroup: Group = {
      id: groupId,
      name: '加入的群组',
      avatar: '',
      memberCount: 1,
      isOwner: false,
    };
    data.groups.push(joinedGroup);
    await contactDb.write(data);
  },

  leaveGroup: async (groupId: string): Promise<void> => {
    await initOnce();
    const data = await contactDb.read() || defaultContactDb;
    data.groups = data.groups.filter(g => g.id !== groupId);
    await contactDb.write(data);
  }
}; 