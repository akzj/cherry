// src/hooks/useMessageReceiver.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useMessageReceiver } from './useMessageReceiver';
import { getEventService, resetEventService } from '../services/eventService';
import type { CherryMessage, Message, StreamEvent } from '../types';

// 辅助函数：渲染消息内容
const renderMessageContent = (content: any): string => {
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object') {
    if (content.text) return content.text;
    if (content.html) return content.html;
    return JSON.stringify(content);
  }
  return String(content);
};

// 测试组件
const MessageReceiverDemo = () => {
  const {
    messages,
    streamEvents,
    isListening,
    clearMessages,
    clearEvents,
  } = useMessageReceiver();

  return (
    <div style={{ padding: 20 }}>
      <h2>Message Receiver Demo</h2>
      <p>Listening: {isListening ? '✅ Active' : '❌ Inactive'}</p>

      <div style={{ margin: '16px 0' }}>
        <h3>Messages ({messages.length})</h3>
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ margin: '8px 0', padding: 8, background: '#f9f9f9' }}>
                <p><strong>User {msg.user_id}</strong> ({new Date(msg.timestamp).toLocaleString()})</p>
                <p>{renderMessageContent(msg.content)}</p>
              </div>
            ))}
            <button onClick={clearMessages} style={{ marginTop: 8 }}>
              Clear Messages
            </button>
          </div>
        )}
      </div>

      <div>
        <h3>Stream Events ({streamEvents.length})</h3>
        {streamEvents.length === 0 ? (
          <p>No stream events yet</p>
        ) : (
          <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
            {streamEvents.map((event, index) => (
              <div key={`event-${index}`} style={{ margin: '8px 0', padding: 8, background: '#f0f8ff' }}>
                <p>Event: <strong>{Object.keys(event)[0]}</strong></p>
                <p>Data: {JSON.stringify(event)}</p>
              </div>
            ))}
            <button onClick={clearEvents} style={{ marginTop: 8 }}>
              Clear Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const meta: Meta<typeof MessageReceiverDemo> = {
  title: 'Hooks/useMessageReceiver',
  component: MessageReceiverDemo,
  decorators: [
    (Story) => {
      resetEventService();
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof MessageReceiverDemo>;

// 测试普通消息
export const ReceiveMessages: Story = {
  play: async () => {
    const eventService = getEventService(true);
    const now = new Date().toISOString();

    // 发送 2 条普通消息
    const msg1: CherryMessage = {
      message: {
        id: 1,
        conversation_id: 'conv-1',
        user_id: 'user1',
        content: 'Hello from mock!',
        timestamp: now,
        type_: 'text'
      },
    };
    eventService.emit('cherry-message', msg1);

    const msg2: CherryMessage = {
      message: {
        id: 2,
        conversation_id: 'conv-1',
        user_id: 'user2',
        content: 'TypeScript 类型测试',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        type_: 'text'
      },
    };
    eventService.emit('cherry-message', msg2);
  },
};

// 测试流事件
export const ReceiveEvents: Story = {
  play: async () => {
    const eventService = getEventService(true);

    // 发送流事件序列
    const event1: CherryMessage = {
      event: { ConversationCreated: { conversation_id: 'conv-1' } },
    };
    eventService.emit('cherry-message', event1);

    await new Promise(resolve => setTimeout(resolve, 500));
    const event2: CherryMessage = {
      event: { ConversationMemberAdded: { conversation_id: 'conv-1', member_id: 'user1' } },
    };
    eventService.emit('cherry-message', event2);

    await new Promise(resolve => setTimeout(resolve, 500));
    const event3: CherryMessage = {
      event: { ConversationMemberRemoved: { conversation_id: 'conv-1', member_id: 'user2' } },
    };
    eventService.emit('cherry-message', event3);
  },
};

// 混合消息测试
export const MixedMessages: Story = {
  play: async () => {
    const eventService = getEventService(true);

    // 交替发送消息和事件
    eventService.emit('cherry-message', {
      message: { 
        id: 1, 
        conversation_id: 'conv-1',
        user_id: 'system',
        content: 'Start', 
        timestamp: new Date().toISOString(),
        type_: 'text'
      },
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    eventService.emit('cherry-message', {
      event: { ConversationCreated: { conversation_id: 'conv-2' } },
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    eventService.emit('cherry-message', {
      message: { 
        id: 2, 
        conversation_id: 'conv-1',
        user_id: 'system',
        content: 'End', 
        timestamp: new Date().toISOString(),
        type_: 'text'
      },
    });
  },
};