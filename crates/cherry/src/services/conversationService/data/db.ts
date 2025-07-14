import { LocalDbAdapter } from '@/services/mock/LocalDbAdapter';
import { ConversationBase } from '@/types/models/conversation';
import { Contact } from '@/types/models/contact';

export type ConversationDbData = {
  conversations: ConversationBase[];
  contacts: Contact[];
};

export const conversationDb = new LocalDbAdapter<ConversationDbData>(
  'mock-conversation-db',
  JSON.stringify,
  JSON.parse
);

export const defaultConversationDb: ConversationDbData = {
  conversations: [
    {
      conversation_id: 'conv-alice',
      conversation_type: 'direct',
      members: ['mock-user-id', 'user-alice'],
      meta: {
        name: 'Alice',
        description: '与 Alice 的对话',
        avatar: 'https://i.pravatar.cc/150?u=alice@example.com'
      },
      stream_id: 1,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      conversation_id: 'conv-bob',
      conversation_type: 'direct',
      members: ['mock-user-id', 'user-bob'],
      meta: {
        name: 'Bob',
        description: '与 Bob 的对话',
        avatar: 'https://i.pravatar.cc/150?u=bob@example.com'
      },
      stream_id: 2,
      created_at: '2024-01-16T14:20:00Z',
      updated_at: '2024-01-16T14:20:00Z'
    },
    {
      conversation_id: 'conv-charlie',
      conversation_type: 'direct',
      members: ['mock-user-id', 'user-charlie'],
      meta: {
        name: 'Charlie',
        description: '与 Charlie 的对话',
        avatar: 'https://i.pravatar.cc/150?u=charlie@example.com'
      },
      stream_id: 3,
      created_at: '2024-01-17T09:15:00Z',
      updated_at: '2024-01-17T09:15:00Z'
    },
    {
      conversation_id: 'conv-diana',
      conversation_type: 'direct',
      members: ['mock-user-id', 'user-diana'],
      meta: {
        name: 'Diana',
        description: '与 Diana 的对话',
        avatar: 'https://i.pravatar.cc/150?u=diana@example.com'
      },
      stream_id: 4,
      created_at: '2024-01-18T16:45:00Z',
      updated_at: '2024-01-18T16:45:00Z'
    },
    {
      conversation_id: 'conv-eve',
      conversation_type: 'direct',
      members: ['mock-user-id', 'user-eve'],
      meta: {
        name: 'Eve',
        description: '与 Eve 的对话',
        avatar: 'https://i.pravatar.cc/150?u=eve@example.com'
      },
      stream_id: 5,
      created_at: '2024-01-19T11:30:00Z',
      updated_at: '2024-01-19T11:30:00Z'
    },
    {
      conversation_id: 'group-cherry-dev',
      conversation_type: 'group',
      members: ['mock-user-id', 'user-alice', 'user-bob', 'user-charlie', 'user-grace', 'user-iris', 'user-kate'],
      meta: {
        name: 'Cherry 开发团队',
        description: 'Cherry 项目开发讨论群',
        avatar: 'https://i.pravatar.cc/150?u=cherry-dev-team'
      },
      stream_id: 6,
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z'
    },
    {
      conversation_id: 'group-product',
      conversation_type: 'group',
      members: ['mock-user-id', 'user-alice', 'user-diana', 'user-eve', 'user-frank', 'user-grace', 'user-henry', 'user-iris', 'user-jack', 'user-kate', 'user-lisa'],
      meta: {
        name: '产品讨论群',
        description: '产品功能讨论与反馈',
        avatar: 'https://i.pravatar.cc/150?u=product-discussion'
      },
      stream_id: 7,
      created_at: '2024-01-21T14:00:00Z',
      updated_at: '2024-01-21T14:00:00Z'
    },
    {
      conversation_id: 'group-tech',
      conversation_type: 'group',
      members: ['mock-user-id', 'user-bob', 'user-charlie', 'user-frank', 'user-grace', 'user-henry', 'user-iris', 'user-jack', 'user-kate', 'user-lisa'],
      meta: {
        name: '技术交流群',
        description: '技术问题交流与分享',
        avatar: 'https://i.pravatar.cc/150?u=tech-exchange'
      },
      stream_id: 8,
      created_at: '2024-01-22T16:00:00Z',
      updated_at: '2024-01-22T16:00:00Z'
    }
  ],
  contacts: []
};

// 初始化数据库，将默认数据写入到本地存储
export const initializeConversationDb = async () => {
  const existingData = await conversationDb.read();
  if (!existingData) {
    await conversationDb.write(defaultConversationDb);
  }
}; 