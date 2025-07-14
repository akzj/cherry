import { LocalDbAdapter } from '@/services/mock/LocalDbAdapter';
import { Contact } from '@/types';
import { Group } from '@/types';

export type ContactDbData = {
  contacts: Contact[];
  groups: Group[];
};

export const contactDb = new LocalDbAdapter<ContactDbData>(
  'mock-contact-db',
  JSON.stringify,
  JSON.parse
);

export const defaultContactDb: ContactDbData = { 
  contacts: [
    {
      contact_id: 'contact-1',
      owner_id: 'mock-user-id',
      target_id: 'user-alice',
      relation_type: 'friend',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      remark_name: 'Alice',
      avatar_url: 'https://i.pravatar.cc/150?u=alice@example.com',
      status: 'online',
      tags: ['colleague', 'friend'],
      is_favorite: true,
      mute_settings: {}
    },
    {
      contact_id: 'contact-2',
      owner_id: 'mock-user-id',
      target_id: 'user-bob',
      relation_type: 'friend',
      created_at: '2024-01-16T14:20:00Z',
      updated_at: '2024-01-16T14:20:00Z',
      remark_name: 'Bob',
      avatar_url: 'https://i.pravatar.cc/150?u=bob@example.com',
      status: 'online',
      tags: ['friend'],
      is_favorite: false,
      mute_settings: {}
    },
    {
      contact_id: 'contact-3',
      owner_id: 'mock-user-id',
      target_id: 'user-charlie',
      relation_type: 'friend',
      created_at: '2024-01-17T09:15:00Z',
      updated_at: '2024-01-17T09:15:00Z',
      remark_name: 'Charlie',
      avatar_url: 'https://i.pravatar.cc/150?u=charlie@example.com',
      status: 'away',
      tags: ['colleague'],
      is_favorite: false,
      mute_settings: {}
    },
    {
      contact_id: 'contact-4',
      owner_id: 'mock-user-id',
      target_id: 'user-diana',
      relation_type: 'friend',
      created_at: '2024-01-18T16:45:00Z',
      updated_at: '2024-01-18T16:45:00Z',
      remark_name: 'Diana',
      avatar_url: 'https://i.pravatar.cc/150?u=diana@example.com',
      status: 'busy',
      tags: ['friend', 'family'],
      is_favorite: true,
      mute_settings: {}
    },
    {
      contact_id: 'contact-5',
      owner_id: 'mock-user-id',
      target_id: 'user-eve',
      relation_type: 'friend',
      created_at: '2024-01-19T11:30:00Z',
      updated_at: '2024-01-19T11:30:00Z',
      remark_name: 'Eve',
      avatar_url: 'https://i.pravatar.cc/150?u=eve@example.com',
      status: 'offline',
      tags: ['colleague'],
      is_favorite: false,
      mute_settings: {}
    },
    {
      contact_id: 'contact-6',
      owner_id: 'mock-user-id',
      target_id: 'user-frank',
      relation_type: 'friend',
      created_at: '2024-01-20T13:20:00Z',
      updated_at: '2024-01-20T13:20:00Z',
      remark_name: 'Frank',
      avatar_url: 'https://i.pravatar.cc/150?u=frank@example.com',
      status: 'online',
      tags: ['friend'],
      is_favorite: false,
      mute_settings: {}
    },
    {
      contact_id: 'contact-7',
      owner_id: 'mock-user-id',
      target_id: 'user-grace',
      relation_type: 'friend',
      created_at: '2024-01-21T08:10:00Z',
      updated_at: '2024-01-21T08:10:00Z',
      remark_name: 'Grace',
      avatar_url: 'https://i.pravatar.cc/150?u=grace@example.com',
      status: 'online',
      tags: ['colleague', 'friend'],
      is_favorite: true,
      mute_settings: {}
    },
    {
      contact_id: 'contact-8',
      owner_id: 'mock-user-id',
      target_id: 'user-henry',
      relation_type: 'friend',
      created_at: '2024-01-22T15:30:00Z',
      updated_at: '2024-01-22T15:30:00Z',
      remark_name: 'Henry',
      avatar_url: 'https://i.pravatar.cc/150?u=henry@example.com',
      status: 'away',
      tags: ['friend'],
      is_favorite: false,
      mute_settings: {}
    },
    {
      contact_id: 'contact-9',
      owner_id: 'mock-user-id',
      target_id: 'user-iris',
      relation_type: 'friend',
      created_at: '2024-01-23T12:45:00Z',
      updated_at: '2024-01-23T12:45:00Z',
      remark_name: 'Iris',
      avatar_url: 'https://i.pravatar.cc/150?u=iris@example.com',
      status: 'online',
      tags: ['colleague'],
      is_favorite: false,
      mute_settings: {}
    },
    {
      contact_id: 'contact-10',
      owner_id: 'mock-user-id',
      target_id: 'user-jack',
      relation_type: 'friend',
      created_at: '2024-01-24T10:20:00Z',
      updated_at: '2024-01-24T10:20:00Z',
      remark_name: 'Jack',
      avatar_url: 'https://i.pravatar.cc/150?u=jack@example.com',
      status: 'busy',
      tags: ['friend'],
      is_favorite: false,
      mute_settings: {}
    },
    {
      contact_id: 'contact-11',
      owner_id: 'mock-user-id',
      target_id: 'user-kate',
      relation_type: 'friend',
      created_at: '2024-01-25T14:15:00Z',
      updated_at: '2024-01-25T14:15:00Z',
      remark_name: 'Kate',
      avatar_url: 'https://i.pravatar.cc/150?u=kate@example.com',
      status: 'online',
      tags: ['colleague', 'friend'],
      is_favorite: true,
      mute_settings: {}
    },
    {
      contact_id: 'contact-12',
      owner_id: 'mock-user-id',
      target_id: 'user-lisa',
      relation_type: 'friend',
      created_at: '2024-01-26T09:30:00Z',
      updated_at: '2024-01-26T09:30:00Z',
      remark_name: 'Lisa',
      avatar_url: 'https://i.pravatar.cc/150?u=lisa@example.com',
      status: 'offline',
      tags: ['friend'],
      is_favorite: false,
      mute_settings: {}
    }
  ], 
  groups: [
    {
      id: 'group-1',
      name: 'Cherry 开发团队',
      avatar: 'https://i.pravatar.cc/150?u=cherry-dev-team',
      memberCount: 8,
      isOwner: true
    },
    {
      id: 'group-2',
      name: '产品讨论群',
      avatar: 'https://i.pravatar.cc/150?u=product-discussion',
      memberCount: 12,
      isOwner: false
    },
    {
      id: 'group-3',
      name: '技术交流群',
      avatar: 'https://i.pravatar.cc/150?u=tech-exchange',
      memberCount: 15,
      isOwner: false
    }
  ] 
}; 

// 初始化数据库，将默认数据写入到本地存储
export const initializeContactDb = async () => {
  const existingData = await contactDb.read();
  if (!existingData) {
    await contactDb.write(defaultContactDb);
  }
}; 