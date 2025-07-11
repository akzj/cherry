
// src/types/types.ts
export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

// 各种消息类型的内容接口
export interface TextContent {
  text: string;
}

export interface ImageContent {
  url: string;
  thumbnail_url: string | undefined;
  metadata: any | undefined;
  text: string | undefined;
}

export interface AudioContent {
  url: string;
  duration: number; // 秒
  title?: string;
  artist?: string;
}

export interface VideoContent {
  url: string;
  thumbnail_url?: string;
  duration: number; // 秒
  width?: number;
  height?: number;
  title?: string;
}

export interface FileContent {
  url: string;
  filename: string;
  size: number; // 字节
  mime_type: string;
  thumbnail_url?: string;
}

export interface SystemContent {
  action: 'user_joined' | 'user_left' | 'conversation_created' | 'message_deleted' | 'user_renamed';
  data: any;
}

export interface EmojiContent {
  native: string;
  unified: string;
  shortcodes: string;
}

export interface CodeContent {
  code: string;
  language: string;
  filename?: string;
}

export interface LocationContent {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface ContactContent {
  user_id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

export interface EventContent {
  event_type: string;
  data: any;
}

export interface CustomContent {
  type: string;
  data: any;
}

export interface ReactionContent {
  emoji: string;
  users: string;
  action: 'add' | 'remove';
}

export interface QuillContent {
  type: 'quill';
  html: string; // Quill 编辑器生成的 HTML
  delta?: any;  // 可选，Quill 的 Delta 格式
}

// 联合类型：所有可能的消息内容
export type MessageContent = 
  | string // 兼容旧的文本格式
  | TextContent
  | ImageContent
  | AudioContent
  | VideoContent
  | FileContent
  | SystemContent
  | EmojiContent
  | CodeContent
  | LocationContent
  | ContactContent
  | EventContent
  | CustomContent
  | ReactionContent
  | QuillContent;

export interface Message {
  id: number;
  conversation_id: string;
  user_id: string;
  content: MessageContent;
  timestamp: string;
  reply_to?: number;
  type_: 'text' | 'image' | 'audio' | 'video' | 'file' | 'system' | 'emoji' | 'code' | 'location' | 'contact' | 'event' | 'custom' | 'reaction' | 'quill';
  replyToMessage?: Message;
  isReply?: boolean;
  reactions?: Reaction[];
}

// 解析后的消息内容类型
export interface ParsedMessageContent {
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'system' | 'emoji' | 'code' | 'location' | 'contact' | 'event' | 'custom' | 'reaction' | 'quill';
  text?: string;
  html?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  code?: string;
  language?: string;
  emoji?: string;
  systemAction?: string;
  systemData?: any;
  customType?: string;
  customData?: any;
  contactId?: string;
  contactName?: string;
  contactAvatar?: string;
  contactPhone?: string;
  contactEmail?: string;
  eventType?: string;
  eventData?: any;
  delta?: any;
}



// 设置项类型
export type SettingCategory = 'general' | 'privacy' | 'notifications' | 'appearance';

// 主题类型
export type ThemePreference = 'light' | 'dark' | 'system';

// 通用设置
export interface GeneralSettings {
  startup: boolean;
  language: string;
  sendWithEnter: boolean;
}

// 隐私设置
export interface PrivacySettings {
  readReceipts: boolean;
  onlineStatus: 'all' | 'contacts' | 'none';
  messageHistory: 'forever' | '30days' | '7days';
}

// 通知设置
export interface NotificationSettings {
  messageAlerts: boolean;
  sound: boolean;
  vibration: boolean;
  previewContent: boolean;
}

// 外观设置
export interface AppearanceSettings {
  theme: ThemePreference;
  fontSize: number;
  density: 'compact' | 'normal' | 'spacious';
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
  | { message: Message }
  | { event: StreamEvent };



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


// 基础联系人类型
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

// 群组类型
export interface Group {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  isOwner: boolean; // 区分创建者/成员
}

// 联系人分组类型
export interface ContactGroup {
  id: string;
  title: string; // 分组标题（如字母 A、B、C 等）
  contacts: Contact[];
}


export { parseMessageContent } from './utils.ts';