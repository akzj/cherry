# EventService 服务说明

## 接口定义

见 `types.ts`：

```typescript
export interface EventService<T = any> {
  listen: (eventName: string, listener: EventListener<T>) => Promise<() => void>;
  emit: (eventName: string, message: T) => void;
  invoke: <R = any>(command: string, args?: any) => Promise<R>;
}
```

## Mock 实现说明
- mockImpl.ts 提供事件监听、触发、invoke等mock能力。
- 支持本地事件模拟，便于前端开发和测试。

## Tauri 实现说明
- tauriImpl.ts 通过 Tauri 事件API和invoke实现。
- 支持真实事件监听、触发和命令调用。

## 用法示例

```typescript
import { getEventService } from '@/services/eventService';

const eventService = getEventService();

// 监听事件
const unlisten = await eventService.listen('message', msg => {
  console.log(msg);
});

// 触发事件（mock模式下有效）
eventService.emit('message', { text: 'hello' });

// 调用命令
const result = await eventService.invoke('some_command', { foo: 1 });
```

## 错误处理
- 所有方法均为 async，遇到错误时抛出异常。
- 建议业务层统一 try/catch 处理。

## mock/tauri 切换
- 通过 `isTauriEnv` 自动切换。
- 业务代码无需关心环境，直接用 `getEventService()`。 