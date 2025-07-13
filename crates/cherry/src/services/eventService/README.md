# EventService - 泛型事件服务

EventService 是一个支持泛型的事件服务，可以处理不同类型的事件和消息，同时支持 Tauri 和 Mock 环境。

## 特性

- ✅ **泛型支持**: 可以为不同类型的事件创建类型安全的服务
- ✅ **环境自适应**: 自动根据环境选择 Tauri 或 Mock 实现
- ✅ **事件监听**: 支持事件监听和取消监听
- ✅ **事件触发**: 支持事件触发（主要用于测试）
- ✅ **命令调用**: 支持调用 Tauri 命令
- ✅ **类型安全**: 完整的 TypeScript 类型支持

## 基本用法

### 使用默认的 CherryMessage 服务

```typescript
import { getEventService } from './services/eventService';

const eventService = getEventService();

// 监听事件
const unlisten = await eventService.listen('notification', (message) => {
  console.log('收到消息:', message);
});

// 调用命令
const result = await eventService.invoke('get_user_info');
```

### 使用泛型创建特定类型的服务

```typescript
import { createEventService } from './services/eventService';

// 定义消息类型
interface ChatMessage {
  sender: string;
  content: string;
  timestamp: number;
}

// 创建特定类型的服务
const chatService = createEventService<ChatMessage>();

// 监听聊天消息
const unlisten = await chatService.listen('chat', (message) => {
  console.log(`${message.sender}: ${message.content}`);
});

// 触发聊天消息
chatService.emit('chat', {
  sender: 'Alice',
  content: 'Hello World!',
  timestamp: Date.now()
});
```

## 高级用法

### 泛型约束

```typescript
interface BaseMessage {
  id: string;
  timestamp: number;
}

interface TypedMessage<T> extends BaseMessage {
  data: T;
}

// 创建带约束的泛型服务
const typedService = createEventService<TypedMessage<string>>();

await typedService.listen('typed-event', (message) => {
  console.log('消息ID:', message.id);
  console.log('消息数据:', message.data);
});
```

### 类型化的命令调用

```typescript
interface UserInfo {
  id: string;
  name: string;
  email: string;
}

const service = createEventService<any>();

// 带类型的命令调用
const userInfo = await service.invoke<UserInfo>('get_user_info');
console.log(userInfo.name); // 类型安全
```

### 多服务实例

```typescript
// 创建不同类型的服务
const notificationService = createEventService<NotificationMessage>();
const chatService = createEventService<ChatMessage>();
const systemService = createEventService<SystemEvent>();

// 每个服务都有独立的类型
await notificationService.listen('notify', (msg) => {
  // msg 的类型是 NotificationMessage
});

await chatService.listen('chat', (msg) => {
  // msg 的类型是 ChatMessage
});
```

## API 参考

### EventService<T>

```typescript
interface EventService<T = any> {
  // 监听指定事件
  listen: (eventName: string, listener: EventListener<T>) => Promise<() => void>;
  
  // 触发事件（用于 Mock 测试）
  emit: (eventName: string, message: T) => void;
  
  // 调用Tauri命令
  invoke: <R = any>(command: string, args?: any) => Promise<R>;
}
```

### 函数

#### getEventService(forceMock?: boolean)

获取默认的 CherryMessage 事件服务实例。

- `forceMock`: 是否强制使用 Mock 服务（测试用）
- 返回: `CherryEventService`

#### createEventService<T>()

创建指定类型的泛型事件服务。

- `T`: 消息类型
- 返回: `EventService<T>`

#### resetEventService()

重置服务实例（测试时用）。

## 测试

EventService 支持完整的测试功能：

```typescript
import { mockEventService } from './services/eventService/mockImpl';

// 在测试中使用 Mock 服务
const service = mockEventService;

// 监听事件
const listener = vi.fn();
const unlisten = await service.listen('test', listener);

// 触发事件
service.emit('test', { message: 'test' });

// 验证监听器被调用
expect(listener).toHaveBeenCalledWith({ message: 'test' });

// 清理
unlisten();
```

## 环境检测

EventService 会自动检测运行环境：

- **Tauri 环境**: 使用真实的 Tauri API
- **非 Tauri 环境**: 使用 Mock 实现
- **测试环境**: 可以通过 `forceMock` 参数强制使用 Mock

## 类型安全

所有操作都是类型安全的：

```typescript
interface MyMessage {
  id: string;
  data: string;
}

const service = createEventService<MyMessage>();

// ✅ 类型正确
service.emit('event', { id: '1', data: 'test' });

// ❌ 类型错误
service.emit('event', { wrong: 'type' }); // 编译错误
```

## 示例

查看 `examples/genericUsage.ts` 文件获取更多使用示例。 