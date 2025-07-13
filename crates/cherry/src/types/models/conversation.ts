import { Message } from "./message";
import { User } from "./user";


export interface ConversationBase{
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