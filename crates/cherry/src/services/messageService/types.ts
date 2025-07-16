import type { Message, MessageContentType } from '@/types';

export interface MessageService {
  sendMessage(
    conversationId: string,
    content: string,
    messageType: MessageContentType,
    replyTo?: number
  ): Promise<void>;

  loadMessages(
    conversationId: string,
    messageId: number,
    direction: 'forward' | 'backward',
    limit: number
  ): Promise<Message[]>;
}

export class ServiceError extends Error {
  code: string;
  constructor(message: string, code = 'SERVICE_ERROR') {
    super(message);
    this.code = code;
  }
} 