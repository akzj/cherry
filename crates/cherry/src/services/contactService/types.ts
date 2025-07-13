import type { Contact } from '@/types';
import type { Group } from '@/types';

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

export class ServiceError extends Error {
  code: string;
  constructor(message: string, code = 'SERVICE_ERROR') {
    super(message);
    this.code = code;
  }
} 