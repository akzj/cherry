import type { ContactService } from './types';
import type { Contact } from '@/types';
import type { Group } from '@/types/contact';
import { contactDb, defaultContactDb } from './data/db';

export const mockContactService: ContactService = {
  listAllContacts: async () => {
    const db = await contactDb.read();
    return db?.contacts || [];
  },
  listAll: async () => {
    const db = await contactDb.read();
    return db?.contacts || [];
  },
  listOwnedGroups: async () => {
    const db = await contactDb.read();
    return db?.groups.filter(g => g.isOwner) || [];
  },
  listJoinedGroups: async () => {
    const db = await contactDb.read();
    return db?.groups.filter(g => !g.isOwner) || [];
  },
  search: async (query) => {
    const db = await contactDb.read();
    if (!db) return [];
    const q = query.toLowerCase();
    return db.contacts.filter(c =>
      (c.remark_name?.toLowerCase().includes(q) ||
        c.contact_id.toLowerCase().includes(q) ||
        c.target_id.toLowerCase().includes(q))
    );
  },
  createGroup: async (groupData) => {
    const db = (await contactDb.read()) || defaultContactDb;
    const newGroup: Group = {
      id: `group_${Date.now()}`,
      name: groupData.name || '新群组',
      avatar: groupData.avatar || '',
      memberCount: 1,
      isOwner: true,
    };
    const updated = { ...db, groups: [...db.groups, newGroup] };
    await contactDb.write(updated);
    return newGroup;
  },
  joinGroup: async (groupId) => {
    // For mock, just set isOwner to false if not already joined
    const db = (await contactDb.read()) || defaultContactDb;
    const group = db.groups.find(g => g.id === groupId);
    if (group && !group.isOwner) return;
    if (group) {
      // Already joined as owner, do nothing
      return;
    }
    const joinedGroup: Group = {
      id: groupId,
      name: '加入的群组',
      avatar: '',
      memberCount: 1,
      isOwner: false,
    };
    const updated = { ...db, groups: [...db.groups, joinedGroup] };
    await contactDb.write(updated);
  },
  leaveGroup: async (groupId) => {
    const db = (await contactDb.read()) || defaultContactDb;
    const updated = { ...db, groups: db.groups.filter(g => g.id !== groupId) };
    await contactDb.write(updated);
  },
}; 