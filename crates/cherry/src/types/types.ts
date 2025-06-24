// src/types/types.ts
export interface User {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
  }
  
  export interface Message {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
    isOwn?: boolean;
    status?: 'sent' | 'delivered' | 'read';
  }
  
  export interface Conversation {
    id: string;
    name: string;
    avatar: string;
    type: 'direct' | 'group';
    mentions: number;
    participants: User[];
    lastMessage?: Message;
    messages: Message[];
    unreadCount: number;
  }

  export interface Contact {
    owner_id: string;
    target_id: string;
    relation_type: string;
    remark_name?: string;
    tags: any[];
    is_favorite: boolean;
    mute_settings: any;
    created_at: string;
    updated_at: string;
  }
  