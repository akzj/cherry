import type { Message } from '@/types';

export interface MessageService {
  sendMessage(
    conversationId: string,
    content: string,
    messageType?: string,
    replyTo?: number
  ): Promise<void>;

  loadMessages(
    conversationId: string,
    messageId: number,
    direction: 'forward' | 'backward',
    limit: number
  ): Promise<Message[]>;
} 