import React from 'react';
import { parseMessageContent, Message } from '../types/types';

// 示例消息数据
const exampleMessages: Message[] = [
  {
    id: 1,
    user_id: 'alice',
    content: 'Hello, World!',
    timestamp: '2024-01-01T12:00:00Z',
    type_: 'text'
  },
  {
    id: 2,
    user_id: 'bob',
    content: {
      url: 'https://example.com/image.jpg',
      thumbnail_url: 'https://example.com/thumb.jpg',
      metadata: { width: 1920, height: 1080 },
      text: '这是一张图片'
    },
    timestamp: '2024-01-01T12:01:00Z',
    type_: 'image'
  },
  {
    id: 3,
    user_id: 'charlie',
    content: {
      url: 'https://example.com/audio.mp3',
      duration: 120,
      title: '音乐标题',
      artist: '艺术家'
    },
    timestamp: '2024-01-01T12:02:00Z',
    type_: 'audio'
  },
  {
    id: 4,
    user_id: 'david',
    content: {
      url: 'https://example.com/document.pdf',
      filename: 'document.pdf',
      size: 1024000,
      mime_type: 'application/pdf',
      thumbnail_url: 'https://example.com/pdf-thumb.jpg'
    },
    timestamp: '2024-01-01T12:03:00Z',
    type_: 'file'
  },
  {
    id: 5,
    user_id: 'system',
    content: {
      action: 'user_joined',
      data: { user_id: '123', username: 'alice' }
    },
    timestamp: '2024-01-01T12:04:00Z',
    type_: 'system'
  },
  {
    id: 6,
    user_id: 'emma',
    content: {
      native: '😊',
      unified: '1f60a',
      shortcodes: ':smile:'
    },
    timestamp: '2024-01-01T12:05:00Z',
    type_: 'emoji'
  },
  {
    id: 7,
    user_id: 'frank',
    content: {
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      filename: 'test.js'
    },
    timestamp: '2024-01-01T12:06:00Z',
    type_: 'code'
  },
  {
    id: 8,
    user_id: 'grace',
    content: {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市朝阳区',
      name: '天安门广场'
    },
    timestamp: '2024-01-01T12:07:00Z',
    type_: 'location'
  },
  {
    id: 9,
    user_id: 'henry',
    content: {
      user_id: '456',
      name: '张三',
      avatar: 'https://example.com/avatar.jpg',
      phone: '+86 138 0000 0000',
      email: 'zhangsan@example.com'
    },
    timestamp: '2024-01-01T12:08:00Z',
    type_: 'contact'
  }
];

// 消息渲染组件
const MessageRenderer: React.FC<{ message: Message }> = ({ message }) => {
  const parsedContent = parseMessageContent(message.content, message.type_);
  
  const renderContent = () => {
    switch (parsedContent.type) {
      case 'text':
        return (
          <div className="message-text">
            <p>{parsedContent.text}</p>
          </div>
        );
        
      case 'image':
        return (
          <div className="message-image">
            <img 
              src={parsedContent.imageUrl} 
              alt={parsedContent.text || '图片'} 
              style={{ maxWidth: '300px', borderRadius: '8px' }}
            />
            {parsedContent.text && (
              <p className="image-caption" style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                {parsedContent.text}
              </p>
            )}
          </div>
        );
        
      case 'audio':
        return (
          <div className="message-audio">
            <audio src={parsedContent.audioUrl} controls style={{ width: '300px' }} />
            <div className="audio-info" style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              <span>时长: {parsedContent.duration}秒</span>
              {parsedContent.text && <span style={{ marginLeft: '16px' }}>标题: {parsedContent.text}</span>}
            </div>
          </div>
        );
        
      case 'file':
        return (
          <div className="message-file" style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '12px',
            maxWidth: '300px'
          }}>
            <div className="file-info">
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                📄 {parsedContent.filename}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                {(parsedContent.fileSize! / 1024 / 1024).toFixed(2)} MB • {parsedContent.mimeType}
              </div>
            </div>
            <a 
              href={parsedContent.fileUrl} 
              download
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              下载文件
            </a>
          </div>
        );
        
      case 'system':
        return (
          <div className="message-system" style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            color: '#6c757d',
            textAlign: 'center'
          }}>
            {parsedContent.text}
          </div>
        );
        
      case 'emoji':
        return (
          <div className="message-emoji" style={{ fontSize: '48px', textAlign: 'center' }}>
            {parsedContent.emoji}
          </div>
        );
        
      case 'code':
        return (
          <div className="message-code" style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div className="code-header" style={{
              backgroundColor: '#f8f9fa',
              padding: '8px 12px',
              borderBottom: '1px solid #ddd',
              fontSize: '12px',
              color: '#666'
            }}>
              <span style={{ marginRight: '8px' }}>语言: {parsedContent.language}</span>
              {parsedContent.text && <span>文件: {parsedContent.text}</span>}
            </div>
            <pre className="code-content" style={{
              margin: 0,
              padding: '12px',
              backgroundColor: '#f8f9fa',
              fontSize: '14px',
              overflow: 'auto'
            }}>
              <code>{parsedContent.code}</code>
            </pre>
          </div>
        );
        
      case 'location':
        return (
          <div className="message-location" style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px',
            maxWidth: '300px'
          }}>
            <div className="location-info" style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                📍 {parsedContent.text}
              </div>
              {parsedContent.address && (
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {parsedContent.address}
                </div>
              )}
            </div>
            <a 
              href={`https://maps.google.com/?q=${parsedContent.latitude},${parsedContent.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              查看地图
            </a>
          </div>
        );
        
      case 'contact':
        return (
          <div className="message-contact" style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px',
            maxWidth: '300px'
          }}>
            <div className="contact-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src={parsedContent.contactAvatar} 
                alt={parsedContent.contactName}
                style={{ width: '48px', height: '48px', borderRadius: '50%' }}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  👤 {parsedContent.contactName}
                </div>
                {parsedContent.contactPhone && (
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '2px' }}>
                    📞 {parsedContent.contactPhone}
                  </div>
                )}
                {parsedContent.contactEmail && (
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    ✉️ {parsedContent.contactEmail}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="message-unknown" style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#721c24',
            fontSize: '14px'
          }}>
            不支持的消息类型: {parsedContent.type}
          </div>
        );
    }
  };
  
  return (
    <div className="message" style={{
      marginBottom: '20px',
      padding: '12px',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      <div className="message-header" style={{
        marginBottom: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{message.user_id}</span>
        <span>{new Date(message.timestamp).toLocaleString()}</span>
      </div>
      {renderContent()}
    </div>
  );
};

// 主示例组件
const MessageParsingExample: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>
        消息内容解析示例
      </h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        这个示例展示了如何使用新的消息内容解析功能来渲染不同类型的消息。
      </p>
      
      <div className="messages-container">
        {exampleMessages.map(message => (
          <MessageRenderer key={message.id} message={message} />
        ))}
      </div>
      
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>使用说明</h3>
        <p style={{ marginBottom: '12px', color: '#666' }}>
          1. 导入解析函数: <code>import {`{ parseMessageContent }`} from './types/types';</code>
        </p>
        <p style={{ marginBottom: '12px', color: '#666' }}>
          2. 解析消息内容: <code>const parsedContent = parseMessageContent(message.content, message.type);</code>
        </p>
        <p style={{ marginBottom: '12px', color: '#666' }}>
          3. 根据解析结果渲染不同的UI组件
        </p>
        <p style={{ color: '#666' }}>
          4. 支持的消息类型: text, image, audio, video, file, system, emoji, code, location, contact, event, custom, reaction
        </p>
      </div>
    </div>
  );
};

export default MessageParsingExample; 