# MessageService 服务说明

## 接口定义

见 `types.ts`：

```typescript
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
```

## Mock 实现说明
- mockImpl.ts 使用本地 LocalDbAdapter 持久化模拟数据。
- 支持消息发送、消息加载等。
- 可用于前端独立开发和自动化测试。

## Tauri 实现说明
- tauriImpl.ts 通过 Tauri invoke 调用后端命令。
- 命令包括：`cmd_message_send`、`cmd_message_load`。

## 用法示例

```typescript
import { messageService } from '@/services/messageService';

async function sendMessage(conversationId: string, content: string) {
  await messageService.sendMessage(conversationId, content);
}

async function loadMessages(conversationId: string, messageId: number) {
  const messages = await messageService.loadMessages(conversationId, messageId, 'backward', 20);
  console.log(messages);
}
```

## 错误处理
- 所有方法均为 async，遇到错误时抛出异常。
- 建议业务层统一 try/catch 处理。

## mock/tauri 切换
- 通过 `isTauriEnv` 自动切换。
- 业务代码无需关心环境，直接用 `messageService`。 