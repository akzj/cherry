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
  content: string | ImageContent;
  timestamp: string;
  reply_to?: number;
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'system' | 'emoji' | 'code' | 'location' | 'contact' | 'event' | 'custom';
  replyToMessage?: Message;
  isReply?: boolean;
  emojiData?: {
    native: string;
    unified: string;
    shortcodes: string;
  };
  reactions?: Reaction[];
}

export interface ImageContent {
  url: string;
  thumbnail_url: string | null;
  metadata: any | null;
  text: string | null;
}

// 后端消息类型
export interface BackendMessage {
  id: number;
  user_id: string;
  content: string;
  timestamp: string;
  reply_to?: number;
  type: string;
}

// 流事件类型
export interface StreamEvent {
  ConversationCreated?: {
    conversation_id: string;
  };
  ConversationMemberAdded?: {
    conversation_id: string;
    member_id: string;
  };
  ConversationMemberRemoved?: {
    conversation_id: string;
    member_id: string;
  };
}

// Cherry消息类型 - 更新为匹配后端格式
export type CherryMessage =
  | { Message: { message: BackendMessage; conversation_id: string } }
  | { Event: { event: StreamEvent } };

// 转换后端消息到前端消息
export function convertBackendMessage(backendMsg: BackendMessage, allMessages?: Message[]): Message {
  const message: Message = {
    id: backendMsg.id,
    userId: backendMsg.user_id,
    content: backendMsg.content,
    timestamp: backendMsg.timestamp,
    reply_to: backendMsg.reply_to,
    type: backendMsg.type as Message['type'],
    isReply: !!backendMsg.reply_to,
  };

  // 如果有 reply_to 且提供了所有消息，尝试找到被回复的消息
  if (backendMsg.reply_to && allMessages) {
    const replyToMessage = allMessages.find(msg => msg.id === backendMsg.reply_to);
    if (replyToMessage) {
      console.log("reply_to found", replyToMessage);
      message.replyToMessage = replyToMessage;
    } else {
      console.log("allMessages", allMessages);
      console.log("reply_to not found", backendMsg.reply_to);
    }
  }

  return message;
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

export function buildReplyRelations(messages: Message[]): Message[] {
  const msgMap = new Map<number, Message>();
  messages.forEach(msg => msgMap.set(msg.id, msg));
  messages.forEach(msg => {
    if (msg.reply_to) {
      msg.replyToMessage = msgMap.get(msg.reply_to) || undefined;
      msg.isReply = !!msg.reply_to;
    }
  });
  return messages;
}

export interface Reaction {
  emoji: string;
  users: string[]; // userId 列表，可重复
}
