import type { Contact } from '@/types';
import type { Group } from '@/types/contact';

export interface ContactService {
  listAllContacts(): Promise<Contact[]>;
  listAll(): Promise<Contact[]>;
  listOwnedGroups(): Promise<Group[]>;
  listJoinedGroups(): Promise<Group[]>;
  search(query: string): Promise<Contact[]>;
  createGroup(groupData: any): Promise<Group>;
  joinGroup(groupId: string): Promise<void>;
  leaveGroup(groupId: string): Promise<void>;
} 