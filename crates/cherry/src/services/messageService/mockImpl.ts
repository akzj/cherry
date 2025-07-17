import type { MessageService } from './types';
import type { Message, ReactionContent } from '@/types';
import { messageDb, defaultMessageDb } from './data/db';
import { listenerService } from '../listenService';
import { makeNewMessageEvent as NewMessageEvent } from '@/types/events';

// 声明window全局变量类型

// 初始化全局变量
if (typeof window !== 'undefined') {
  if (!window.__AUTO_INCREMENT_ID__) {
    window.__AUTO_INCREMENT_ID__ = Date.now();
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

    // check reactions
    if (messageType === 'reaction') {
      const reactionData = JSON.parse(content) as ReactionContent
      // get the original message
      const originalMessage = data.messagesMap[conversationId].find((msg: Message) => msg.id === reactionData.message_id);
      if (!originalMessage) {
        throw new Error(`Original message with ID ${replyTo} not found in conversation ${conversationId}`);
      }
      // add reaction to the original message
      const reaction = originalMessage.reactions?.find((r) => r.emoji === reactionData.emoji);
      if (!reaction && reactionData.action === 'remove') {
        throw new Error(`Reaction ${reactionData.emoji} not found in message ${replyTo}`);
      }
      if (reactionData.action === 'remove') {
        // remove the reaction by userId
        if (reaction) {
          reaction.users = reaction.users.filter((user) => user !== userId);
          if (reaction.users.length === 0) {
            // 如果没有用户了，删除这个reaction
            originalMessage.reactions = originalMessage.reactions?.filter((r) => r.emoji !== reactionData.emoji);
          }
        }
      } else if (reactionData.action === 'add') {
        // ensure users is an array
        console.log('Reaction already exists, adding user:', userId, reaction);
        if (!reaction) {
          originalMessage.reactions = originalMessage.reactions || [];
          originalMessage.reactions.push({ emoji: reactionData.emoji, users: [userId] });
        } else {
          // find or create the reaction
          originalMessage.reactions = originalMessage.reactions || [];
          const reactionIndex = originalMessage.reactions.findIndex((r) => r.emoji === reactionData.emoji);
          if (reactionIndex !== -1) {
            // check user existence
            if (!originalMessage.reactions[reactionIndex].users.includes(userId)) {
              // add user to existing reaction
              originalMessage.reactions[reactionIndex].users.push(userId);
            }
          } else {
            originalMessage.reactions.push({ emoji: reactionData.emoji, users: [userId] });
          }
        }
      }

      // update the original message
      data.messagesMap[conversationId] = data.messagesMap[conversationId].map((msg: Message) =>
        msg.id === reactionData.message_id ? originalMessage : msg
      );
      await messageDb.write(data);
      // trigger the event

      listenerService.trigger!(NewMessageEvent(conversationId), originalMessage);
      return; // no need to create a new message for reactions
    }

    const message = {
      content: content,
      conversation_id: conversationId,
      type_: messageType as Message['type_'],
      reply_to: replyTo,
      id: window.__AUTO_INCREMENT_ID__++,
      timestamp: new Date().toISOString(),
      user_id: userId,
    }

    data.messagesMap[conversationId].push(message);
    await messageDb.write(data);
    listenerService.trigger!(NewMessageEvent(conversationId), message);
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