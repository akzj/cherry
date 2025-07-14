import type { MessageService } from './types';
import type { Message } from '@/types';
import { messageDb, defaultMessageDb } from './data/db';
import { getCurrentUserId } from '@/store/auth';

// 声明window全局变量类型
declare global {
  interface Window {
    __CURRENT_USER_ID__?: string;
  }
}

export const mockMessageService: MessageService = {
  sendMessage: async (conversationId, content, messageType = 'text', replyTo) => {
    const userId = window.__CURRENT_USER_ID__ || '';

    console.log(conversationId, userId, content, messageType, replyTo)

    const data = (await messageDb.read()) || defaultMessageDb;
    if (!data.messagesMap[conversationId]) {
      data.messagesMap[conversationId] = [];
    }
    data.messagesMap[conversationId].push({
      content: content,
      conversation_id: conversationId,
      type_: messageType as Message['type_'],
      reply_to: replyTo,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user_id: userId,
    });
    await messageDb.write(data);
  },
  loadMessages: async (conversationId, messageId, direction, limit) => {
    const data = await messageDb.read();
    const messages = data?.messagesMap[conversationId] || [];
    if (!messages.length) {
      return [];
    }
    const idx = messages.findIndex((msg: Message) => msg.id === messageId);
    let result: Message[] = [];
    if (direction === 'backward') {
      const end = idx === -1 ? messages.length : idx;
      const start = Math.max(0, end - limit);
      result = messages.slice(start, end);
    } else {
      const start = idx === -1 ? 0 : idx + 1;
      const end = Math.min(messages.length, start + limit);
      result = messages.slice(start, end);
    }
    return result;
  }
}; 