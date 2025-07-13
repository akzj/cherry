import { invoke } from '@tauri-apps/api/core';
import type { ContactService } from './types';
import type { Contact } from '@/types';
import type { Group } from '@/types';

export const tauriContactService: ContactService = {
  listAllContacts: async () => {
    return await invoke<Contact[]>('cmd_contact_list_all');
  },
  listAll: async () => {
    return await invoke<Contact[]>('cmd_contact_list_all');
  },
  listOwnedGroups: async () => {
    return await invoke<Group[]>('cmd_group_list_owned');
  },
  listJoinedGroups: async () => {
    return await invoke<Group[]>('cmd_group_list_joined');
  },
  search: async (query) => {
    return await invoke<Contact[]>('cmd_contact_search', { query });
  },
  createGroup: async (groupData) => {
    return await invoke<Group>('cmd_group_create', { groupData });
  },
  joinGroup: async (groupId) => {
    await invoke('cmd_group_join', { groupId });
  },
  leaveGroup: async (groupId) => {
    await invoke('cmd_group_leave', { groupId });
  }
}; 