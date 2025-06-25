// src/types/types.ts
export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface Message {
  id: number;
  userId: string;
  content: string;
  timestamp: string;
  reply_to?: number;
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'system' | 'emoji' | 'code' | 'location' | 'contact' | 'event' | 'custom';
}



// pub struct Conversation {
//   pub conversation_id: Uuid,
//   pub conversation_type: String,
//   pub members: Value,
//   pub meta: Value,
//   pub stream_id: i64,
//   pub created_at: DateTime<chrono::Utc>,
//   pub updated_at: DateTime<chrono::Utc>,
// }

export interface ConversationBase {
  conversation_id: string;
  conversation_type: string;
  members: string[];
  meta: {
    name: string;
    description: string;
    avatar: string;
  };
  stream_id: number;
  created_at: string;
  updated_at: string;
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
