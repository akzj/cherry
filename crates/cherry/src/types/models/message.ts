

// 各种消息类型的内容接口
export interface TextContent {
    text: string;
}

export interface ImageContent {
    url: string;
    thumbnail_url: string | undefined;
    metadata: {
        height?: number;
        width?: number;
        size?: number;
    } | undefined;
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
    message_id: number; // 目标消息ID
    emoji: string;
    users: string;
    action: 'add' | 'remove';
}

export interface QuillContent {
    type: 'quill';
    html: string; // Quill 编辑器生成的 HTML
    delta?: any;  // 可选，Quill 的 Delta 格式
}


// buildReplyRelations函数已移动到typeUtils.ts

export interface Reaction {
    emoji: string;
    users: string[]; // userId 列表，可重复
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


export type MessageContentType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'system' | 'emoji' | 'code' | 'location' | 'contact' | 'event' | 'custom' | 'reaction' | 'quill'

export interface Message {
    id: number;
    conversation_id: string;
    user_id: string;
    content: MessageContent;
    timestamp: string;
    reply_to?: number;
    type_: MessageContentType
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
    imageHeight?: number;
    imageWidth?: number;
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
