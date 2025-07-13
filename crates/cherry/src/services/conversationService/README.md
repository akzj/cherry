# ConversationService 服务说明

## 接口定义

见 `types.ts`：

```typescript
export interface ConversationService {
  listAllConversations(): Promise<ConversationBase[]>;
  listAllContacts(): Promise<Contact[]>;
  createConversation(targetUserId: string): Promise<{ conversation_id: string }>;
}
```

## Mock 实现说明
- mockImpl.ts 使用本地 LocalDbAdapter 持久化模拟数据。
- 支持会话列表、联系人列表、创建会话等。
- 可用于前端独立开发和自动化测试。

## Tauri 实现说明
- tauriImpl.ts 通过 Tauri invoke 调用后端命令。
- 命令包括：`cmd_conversation_list_all`、`cmd_conversation_create`。

## 用法示例

```typescript
import { conversationService } from '@/services/conversationService';

async function showConversations() {
  const conversations = await conversationService.listAllConversations();
  console.log(conversations);
}

async function createConversation(targetUserId: string) {
  const result = await conversationService.createConversation(targetUserId);
  console.log(result.conversation_id);
}
```

## 错误处理
- 所有方法均为 async，遇到错误时抛出异常。
- 建议业务层统一 try/catch 处理。

## mock/tauri 切换
- 通过 `isTauriEnv` 自动切换。
- 业务代码无需关心环境，直接用 `conversationService`。 