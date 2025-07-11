// tauri api

import { invoke } from "@tauri-apps/api/core";
import { Message } from "@/types";

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

export const loadMessages = async (conversationId: string, messageId: number, direction: 'forward' | 'backward', limit: number) => {
    return invoke<Message[]>('cmd_list_messages', {
      conversationId: conversationId,
      forwardId: direction === 'forward' ? messageId : undefined,
      backwardId: direction === 'backward' ? messageId : undefined,
      limit: limit,
    }); 
  };