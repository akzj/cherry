import { invoke } from '@tauri-apps/api/core';
import type { MessageService } from './types';
import type { Message } from '@/types';

export const tauriMessageService: MessageService = {
  sendMessage: async (conversationId, content, messageType = 'text', replyTo) => {
    await invoke('cmd_send_message', {
      conversationId,
      content,
      messageType,
      replyTo
    });
  },
  loadMessages: async (conversationId, messageId, direction, limit) => {
    return await invoke<Message[]>('cmd_list_messages', {
      conversationId,
      forwardId: direction === 'forward' ? messageId : undefined,
      backwardId: direction === 'backward' ? messageId : undefined,
      limit
    });
  }
}; 