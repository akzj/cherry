// src/services/eventService/examples/genericUsage.ts
import { createEventService } from '../index';

// 定义不同类型的消息
interface NotificationMessage {
  type: 'notification';
  title: string;
  message: string;
  timestamp: number;
}

interface ChatMessage {
  type: 'chat';
  sender: string;
  content: string;
  room: string;
}

interface SystemEvent {
  type: 'system';
  action: 'startup' | 'shutdown' | 'error';
  details: any;
}

// 创建特定类型的事件服务
const notificationService = createEventService<NotificationMessage>();
const chatService = createEventService<ChatMessage>();
const systemService = createEventService<SystemEvent>();

// 使用示例
export const exampleUsage = async () => {
  // 监听通知消息
  const unlistenNotification = await notificationService.listen('app-notification', (message) => {
    console.log('收到通知:', message.title, message.message);
  });

  // 监听聊天消息
  const unlistenChat = await chatService.listen('chat-message', (message) => {
    console.log(`${message.sender} 在 ${message.room} 说: ${message.content}`);
  });

  // 监听系统事件
  const unlistenSystem = await systemService.listen('system-event', (event) => {
    console.log('系统事件:', event.action, event.details);
  });

  // 触发事件
  notificationService.emit('app-notification', {
    type: 'notification',
    title: '欢迎',
    message: '应用已启动',
    timestamp: Date.now()
  });

  chatService.emit('chat-message', {
    type: 'chat',
    sender: 'Alice',
    content: 'Hello World!',
    room: 'general'
  });

  systemService.emit('system-event', {
    type: 'system',
    action: 'startup',
    details: { version: '1.0.0' }
  });

  // 调用命令（带类型）
  const userInfo = await notificationService.invoke<{ id: string; name: string }>('get_user_info');
  console.log('用户信息:', userInfo);

  // 清理监听器
  unlistenNotification();
  unlistenChat();
  unlistenSystem();
};

// 泛型约束示例
interface BaseMessage {
  id: string;
  timestamp: number;
}

interface TypedMessage<T> extends BaseMessage {
  data: T;
}

// 创建带约束的泛型服务
const typedService = createEventService<TypedMessage<string>>();

export const constrainedExample = async () => {
  const unlisten = await typedService.listen('typed-event', (message) => {
    console.log('类型化消息:', message.id, message.data);
  });

  typedService.emit('typed-event', {
    id: 'msg-1',
    timestamp: Date.now(),
    data: 'Hello from typed service!'
  });

  unlisten();
}; 