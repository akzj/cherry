// tauri api

import { invoke } from "@tauri-apps/api/core";
import { Message } from "../types/types";

export const sendMessage = async (
    conversationId: string,
    content: string,
    messageType?: string,
    replyTo?: number
) => {
    await invoke('cmd_send_message', {
        conversationId,
        content,
        messageType: messageType || 'text',
        replyTo
    });
};

// 发送一条 reaction 类型的消息
export const addReaction = async (conversationId: string, messageId: number, emoji: string, userId: string) => {
    await sendMessage(
        conversationId,
        JSON.stringify({ emoji, users: userId, action: 'add', targetMessageId: messageId }),
        'reaction'
    );
};

// 发送一条 reaction 类型的消息
export const removeReaction = async (conversationId: string, messageId: number, emoji: string, userId: string) => {
    await sendMessage(
        conversationId,
        JSON.stringify({ emoji, users: userId, action: 'remove', targetMessageId: messageId }),
        'reaction'
    );
};


export const loadMessages = async (conversationId: string, messageId: number, direction: 'forward' | 'backward', limit: number) => {
    console.log(`Loading messages for conversation ${conversationId}, direction: ${direction}, messageId: ${messageId}, limit: ${limit}`);
    const messages = await invoke<Message[]>('cmd_list_messages', {
      conversationId: conversationId,
      forwardId: direction === 'forward' ? messageId : undefined,
      backwardId: direction === 'backward' ? messageId : undefined,
      limit: limit,
    }); 
    return messages;
  };