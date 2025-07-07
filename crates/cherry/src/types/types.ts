import { Key } from "react";
import { ItemKeyType } from "../hooks/use-bidirectional-data";

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

// 根据消息类型解析内容的函数
export function parseMessageContent(content: MessageContent, messageType: string): ParsedMessageContent {
  // 如果是字符串，尝试解析为JSON
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return parseMessageContent(parsed, messageType);
    } catch {
      // 解析失败，当作普通文本
      return {
        type: 'text',
        text: content
      };
    }
  }

  // 根据消息类型解析内容
  switch (messageType) {
    case 'text':
      if (typeof content === 'string') {
        return { type: 'text', text: content };
      }
      if ('text' in content) {
        return { type: 'text', text: content.text };
      }
      return { type: 'text', text: JSON.stringify(content) };

    case 'image':
      if ('url' in content && 'thumbnail_url' in content) {
        const imageContent = content as ImageContent;
        return {
          type: 'image',
          text: imageContent.text ?? undefined,
          imageUrl: imageContent.url
        };
      }
      return { type: 'image', imageUrl: 'unknown' };

    case 'audio':
      if ('url' in content && 'duration' in content) {
        return {
          type: 'audio',
          audioUrl: content.url,
          duration: content.duration,
          text: content.title || undefined
        };
      }
      return { type: 'audio', audioUrl: 'unknown' };

    case 'video':
      if ('url' in content && 'duration' in content) {
        return {
          type: 'video',
          videoUrl: content.url,
          duration: content.duration,
          text: content.title || undefined
        };
      }
      return { type: 'video', videoUrl: 'unknown' };

    case 'file':
      if ('url' in content && 'filename' in content && 'size' in content) {
        return {
          type: 'file',
          fileUrl: content.url,
          filename: content.filename,
          fileSize: content.size,
          mimeType: content.mime_type
        };
      }
      return { type: 'file', fileUrl: 'unknown' };

    case 'system':
      if ('action' in content && 'data' in content) {
        return {
          type: 'system',
          systemAction: content.action,
          systemData: content.data,
          text: `系统消息: ${content.action}`
        };
      }
      return { type: 'system', text: '系统消息' };

    case 'emoji':
      if ('native' in content && 'unified' in content) {
        return {
          type: 'emoji',
          emoji: content.native,
          text: content.native
        };
      }
      return { type: 'emoji', emoji: '😊', text: '😊' };

    case 'code':
      if ('code' in content && 'language' in content) {
        return {
          type: 'code',
          code: content.code,
          language: content.language,
          text: content.filename || `${content.language} 代码`
        };
      }
      return { type: 'code', text: '代码' };

    case 'location':
      if ('latitude' in content && 'longitude' in content) {
        return {
          type: 'location',
          latitude: content.latitude,
          longitude: content.longitude,
          address: content.address,
          text: content.name || content.address || '位置信息'
        };
      }
      return { type: 'location', text: '位置信息' };

    case 'contact':
      if ('user_id' in content && 'name' in content) {
        return {
          type: 'contact',
          contactId: content.user_id,
          contactName: content.name,
          contactAvatar: content.avatar,
          contactPhone: content.phone,
          contactEmail: content.email,
          text: `联系人: ${content.name}`
        };
      }
      return { type: 'contact', text: '联系人' };

    case 'event':
      if ('event_type' in content && 'data' in content) {
        return {
          type: 'event',
          eventType: content.event_type,
          eventData: content.data,
          text: `事件: ${content.event_type}`
        };
      }
      return { type: 'event', text: '事件' };

    case 'custom':
      if ('type' in content && 'data' in content) {
        return {
          type: 'custom',
          customType: content.type,
          customData: content.data,
          text: `自定义消息: ${content.type}`
        };
      }
      return { type: 'custom', text: '自定义消息' };

    case 'reaction':
      if ('emoji' in content && 'users' in content) {
        return {
          type: 'reaction',
          text: `反应: ${content.emoji}`
        };
      }
      return { type: 'reaction', text: '反应消息' };

    case 'quill':
      if ('html' in content) {
        return {
          type: 'quill',
          html: content.html,
          delta: content.delta,
          text: content.html // 可选：用于纯文本预览
        };
      }
      return { type: 'quill', html: '', text: '' };

    default:
      return {
        type: 'text',
        text: typeof content === 'string' ? content : JSON.stringify(content)
      };
  }
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
