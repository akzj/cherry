import { User,Message } from ".";

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
    contact_id: string;
    owner_id: string;
    target_id: string;
    relation_type: string;
    created_at: string;
    updated_at: string;
    remark_name?: string;
    avatar_url: string;
    status: string;
    tags: any[];
    is_favorite: boolean;
    mute_settings: any;
  }
  