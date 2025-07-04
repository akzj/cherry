# 消息内容解析功能

本文档介绍如何使用新的消息内容解析功能，该功能可以根据消息类型自动解析不同类型的消息内容。

## 概述

新的解析系统支持以下消息类型：
- `text` - 文本消息
- `image` - 图片消息
- `audio` - 音频消息
- `video` - 视频消息
- `file` - 文件消息
- `system` - 系统消息
- `emoji` - 表情消息
- `code` - 代码消息
- `location` - 位置消息
- `contact` - 联系人消息
- `event` - 事件消息
- `custom` - 自定义消息

## 基本用法

### 导入解析函数

```typescript
import { parseMessageContent, Message, ParsedMessageContent } from './types/types';
```

### 解析消息内容

```typescript
// 解析消息内容
const parsedContent = parseMessageContent(message.content, message.type);

// 根据解析结果渲染不同的UI
switch (parsedContent.type) {
  case 'text':
    return <div>{parsedContent.text}</div>;
    
  case 'image':
    return (
      <div>
        <img src={parsedContent.imageUrl} alt={parsedContent.text || '图片'} />
        {parsedContent.text && <p>{parsedContent.text}</p>}
      </div>
    );
    
  case 'audio':
    return (
      <div>
        <audio src={parsedContent.audioUrl} controls />
        <p>时长: {parsedContent.duration}秒</p>
        {parsedContent.text && <p>{parsedContent.text}</p>}
      </div>
    );
    
  // ... 其他类型的处理
}
```

## 消息类型详解

### 1. 文本消息 (text)

```typescript
// 简单文本
const textMessage = {
  content: "Hello, World!",
  type: "text"
};

// 或者使用对象格式
const textMessageObj = {
  content: { text: "Hello, World!" },
  type: "text"
};
```

### 2. 图片消息 (image)

```typescript
const imageMessage = {
  content: {
    url: "https://example.com/image.jpg",
    thumbnail_url: "https://example.com/thumb.jpg",
    metadata: { width: 1920, height: 1080 },
    text: "这是一张图片"
  },
  type: "image"
};
```

### 3. 音频消息 (audio)

```typescript
const audioMessage = {
  content: {
    url: "https://example.com/audio.mp3",
    duration: 120, // 秒
    title: "音乐标题",
    artist: "艺术家"
  },
  type: "audio"
};
```

### 4. 视频消息 (video)

```typescript
const videoMessage = {
  content: {
    url: "https://example.com/video.mp4",
    thumbnail_url: "https://example.com/video-thumb.jpg",
    duration: 300, // 秒
    width: 1920,
    height: 1080,
    title: "视频标题"
  },
  type: "video"
};
```

### 5. 文件消息 (file)

```typescript
const fileMessage = {
  content: {
    url: "https://example.com/document.pdf",
    filename: "document.pdf",
    size: 1024000, // 字节
    mime_type: "application/pdf",
    thumbnail_url: "https://example.com/pdf-thumb.jpg"
  },
  type: "file"
};
```

### 6. 系统消息 (system)

```typescript
const systemMessage = {
  content: {
    action: "user_joined", // user_joined | user_left | conversation_created | message_deleted | user_renamed
    data: { user_id: "123", username: "alice" }
  },
  type: "system"
};
```

### 7. 表情消息 (emoji)

```typescript
const emojiMessage = {
  content: {
    native: "😊",
    unified: "1f60a",
    shortcodes: ":smile:"
  },
  type: "emoji"
};
```

### 8. 代码消息 (code)

```typescript
const codeMessage = {
  content: {
    code: 'console.log("Hello, World!");',
    language: "javascript",
    filename: "test.js"
  },
  type: "code"
};
```

### 9. 位置消息 (location)

```typescript
const locationMessage = {
  content: {
    latitude: 39.9042,
    longitude: 116.4074,
    address: "北京市朝阳区",
    name: "天安门广场"
  },
  type: "location"
};
```

### 10. 联系人消息 (contact)

```typescript
const contactMessage = {
  content: {
    user_id: "456",
    name: "张三",
    avatar: "https://example.com/avatar.jpg",
    phone: "+86 138 0000 0000",
    email: "zhangsan@example.com"
  },
  type: "contact"
};
```

### 11. 事件消息 (event)

```typescript
const eventMessage = {
  content: {
    event_type: "message_edited",
    data: { message_id: 789, new_content: "更新后的内容" }
  },
  type: "event"
};
```

### 12. 自定义消息 (custom)

```typescript
const customMessage = {
  content: {
    type: "poll",
    data: { 
      question: "你最喜欢的颜色？", 
      options: ["红色", "蓝色", "绿色"] 
    }
  },
  type: "custom"
};
```

## 解析结果类型

解析函数返回 `ParsedMessageContent` 类型，包含以下字段：

```typescript
interface ParsedMessageContent {
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'system' | 'emoji' | 'code' | 'location' | 'contact' | 'event' | 'custom';
  text?: string;                    // 显示文本
  imageUrl?: string;                // 图片URL
  audioUrl?: string;                // 音频URL
  videoUrl?: string;                // 视频URL
  fileUrl?: string;                 // 文件URL
  filename?: string;                // 文件名
  fileSize?: number;                // 文件大小
  mimeType?: string;                // MIME类型
  duration?: number;                // 时长（秒）
  latitude?: number;                // 纬度
  longitude?: number;               // 经度
  address?: string;                 // 地址
  code?: string;                    // 代码内容
  language?: string;                // 编程语言
  emoji?: string;                   // 表情符号
  systemAction?: string;            // 系统动作
  systemData?: any;                 // 系统数据
  customType?: string;              // 自定义类型
  customData?: any;                 // 自定义数据
  contactId?: string;               // 联系人ID
  contactName?: string;             // 联系人姓名
  contactAvatar?: string;           // 联系人头像
  contactPhone?: string;            // 联系人电话
  contactEmail?: string;            // 联系人邮箱
  eventType?: string;               // 事件类型
  eventData?: any;                  // 事件数据
}
```

## 实际使用示例

### 在消息组件中使用

```typescript
import React from 'react';
import { parseMessageContent } from '../types/types';

const MessageRenderer: React.FC<{ message: Message }> = ({ message }) => {
  const parsedContent = parseMessageContent(message.content, message.type);
  
  const renderContent = () => {
    switch (parsedContent.type) {
      case 'text':
        return <div className="message-text">{parsedContent.text}</div>;
        
      case 'image':
        return (
          <div className="message-image">
            <img src={parsedContent.imageUrl} alt={parsedContent.text || '图片'} />
            {parsedContent.text && <p className="image-caption">{parsedContent.text}</p>}
          </div>
        );
        
      case 'audio':
        return (
          <div className="message-audio">
            <audio src={parsedContent.audioUrl} controls />
            <div className="audio-info">
              <span>时长: {parsedContent.duration}秒</span>
              {parsedContent.text && <span>标题: {parsedContent.text}</span>}
            </div>
          </div>
        );
        
      case 'file':
        return (
          <div className="message-file">
            <div className="file-info">
              <span className="filename">{parsedContent.filename}</span>
              <span className="filesize">{(parsedContent.fileSize! / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <a href={parsedContent.fileUrl} download>下载文件</a>
          </div>
        );
        
      case 'location':
        return (
          <div className="message-location">
            <div className="location-info">
              <span className="name">{parsedContent.text}</span>
              {parsedContent.address && <span className="address">{parsedContent.address}</span>}
            </div>
            <a 
              href={`https://maps.google.com/?q=${parsedContent.latitude},${parsedContent.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              查看地图
            </a>
          </div>
        );
        
      case 'code':
        return (
          <div className="message-code">
            <div className="code-header">
              <span className="language">{parsedContent.language}</span>
              {parsedContent.text && <span className="filename">{parsedContent.text}</span>}
            </div>
            <pre className="code-content">
              <code>{parsedContent.code}</code>
            </pre>
          </div>
        );
        
      case 'contact':
        return (
          <div className="message-contact">
            <div className="contact-info">
              <img src={parsedContent.contactAvatar} alt={parsedContent.contactName} />
              <div>
                <span className="name">{parsedContent.contactName}</span>
                {parsedContent.contactPhone && <span className="phone">{parsedContent.contactPhone}</span>}
              </div>
            </div>
          </div>
        );
        
      default:
        return <div className="message-unknown">不支持的消息类型: {parsedContent.type}</div>;
    }
  };
  
  return (
    <div className="message">
      <div className="message-header">
        <span className="username">{message.userId}</span>
        <span className="timestamp">{message.timestamp}</span>
      </div>
      {renderContent()}
    </div>
  );
};
```

### 在回复消息中使用

```typescript
const ReplyPreview: React.FC<{ message: Message }> = ({ message }) => {
  const parsedContent = parseMessageContent(message.content, message.type);
  
  const getPreviewText = () => {
    switch (parsedContent.type) {
      case 'text':
        return parsedContent.text?.substring(0, 50) + (parsedContent.text!.length > 50 ? '...' : '');
      case 'image':
        return `📷 ${parsedContent.text || '图片'}`;
      case 'audio':
        return `🎵 ${parsedContent.text || '音频'}`;
      case 'video':
        return `🎬 ${parsedContent.text || '视频'}`;
      case 'file':
        return `📄 ${parsedContent.filename}`;
      case 'location':
        return `📍 ${parsedContent.text || '位置'}`;
      case 'contact':
        return `👤 ${parsedContent.contactName}`;
      default:
        return `[${parsedContent.type}] ${parsedContent.text || ''}`;
    }
  };
  
  return (
    <div className="reply-preview">
      <span className="reply-label">回复:</span>
      <span className="reply-content">{getPreviewText()}</span>
    </div>
  );
};
```

## 测试

运行测试来验证解析功能：

```typescript
import { runTests } from './test-message-parsing';

// 在浏览器控制台中运行
runTests();
```

## 注意事项

1. **向后兼容性**: 解析函数支持字符串格式的旧消息内容，会自动尝试解析为JSON
2. **错误处理**: 如果解析失败，会返回默认的文本类型
3. **类型安全**: 使用TypeScript确保类型安全
4. **扩展性**: 可以轻松添加新的消息类型和内容格式

## 迁移指南

如果你有现有的消息处理代码，可以按以下步骤迁移：

1. 更新导入语句，使用新的解析函数
2. 将 `parseMessageContent(message.content)` 改为 `parseMessageContent(message.content, message.type)`
3. 根据解析结果的类型字段来渲染不同的UI组件
4. 测试所有消息类型是否正确显示 