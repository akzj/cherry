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
  