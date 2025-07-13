import { LocalDbAdapter } from '@/services/mock/LocalDbAdapter';
import { Message } from '@/types';

export type MessageDbData = {
  messagesMap: Record<string, Message[]>;
};

export const messageDb = new LocalDbAdapter<MessageDbData>(
  'mock-message-db',
  JSON.stringify,
  JSON.parse
);
export const defaultMessageDb: MessageDbData = { messagesMap: {} };