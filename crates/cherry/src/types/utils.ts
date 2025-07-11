import { ImageContent, MessageContent, ParsedMessageContent } from ".";

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