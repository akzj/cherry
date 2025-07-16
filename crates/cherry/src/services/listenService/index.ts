export * from './types';
import { MockListenerService } from './mockImpl';
import { ListenerService } from './types';

export const listenerService: ListenerService = new MockListenerService;