# ContactService 服务说明

## 接口定义

见 `types.ts`：

```typescript
export interface ContactService {
  listAllContacts(): Promise<Contact[]>;
  listAll(): Promise<Contact[]>;
  listOwnedGroups(): Promise<Group[]>;
  listJoinedGroups(): Promise<Group[]>;
  search(query: string): Promise<Contact[]>;
  createGroup(groupData: any): Promise<Group>;
  joinGroup(groupId: string): Promise<void>;
  leaveGroup(groupId: string): Promise<void>;
}
```

## Mock 实现说明
- mockImpl.ts 使用本地 LocalDbAdapter 持久化模拟数据。
- 支持 group 增删查、联系人查找、群组加入/退出等。
- 可用于前端独立开发和自动化测试。

## Tauri 实现说明
- tauriImpl.ts 通过 Tauri invoke 调用后端命令。
- 命令包括：`cmd_contact_list_all`、`cmd_group_list_owned`、`cmd_group_list_joined`、`cmd_contact_search`、`cmd_group_create`、`cmd_group_join`、`cmd_group_leave`。

## 用法示例

```typescript
import { contactService } from '@/services/contactService';

async function showContacts() {
  const contacts = await contactService.listAllContacts();
  console.log(contacts);
}

async function createGroup() {
  const group = await contactService.createGroup({ name: '新群组' });
  console.log(group);
}
```

## 错误处理
- 所有方法均为 async，遇到错误时抛出异常。
- 建议业务层统一 try/catch 处理。

## mock/tauri 切换
- 通过 `isTauriEnv` 自动切换。
- 业务代码无需关心环境，直接用 `contactService`。 