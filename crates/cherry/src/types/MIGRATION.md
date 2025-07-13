# 类型定义迁移指南

## 概述

本次重构将类型定义重新组织为模块化结构，所有类型现在通过 `@/types` 统一导出。

## 迁移规则

### 1. 统一导入路径

**旧方式（已废弃）：**
```typescript
import { Contact } from '@/types/contact';
import { Message } from '@/types/message';
import { User } from '@/types/user';
import { Conversation } from '@/types/conversation';
import { ThemePreference } from '@/types/settings';
```

**新方式（推荐）：**
```typescript
import { Contact, Message, User, Conversation, ThemePreference } from '@/types';
```

### 2. 具体迁移对照表

| 旧路径 | 新路径 | 说明 |
|--------|--------|------|
| `@/types/contact` | `@/types` | 联系人相关类型 |
| `@/types/message` | `@/types` | 消息相关类型 |
| `@/types/user` | `@/types` | 用户相关类型 |
| `@/types/conversation` | `@/types` | 会话相关类型 |
| `@/types/settings` | `@/types` | 设置相关类型 |
| `@/types/login` | `@/types` | 登录相关类型 |
| `@/types/types` | `@/types` | 通用类型 |

### 3. 工具函数迁移

**旧方式：**
```typescript
import { parseMessageContent, buildReplyRelations } from '@/types/utils';
```

**新方式：**
```typescript
import { parseMessageContent, buildReplyRelations } from '@/types';
```

## 需要修复的文件列表

### 组件文件
- [ ] `src/components/ContactList.tsx`
- [ ] `src/components/ContactPage/ContactProfileModal.tsx`
- [ ] `src/components/ContactPage/GroupSection.tsx`
- [ ] `src/components/ContactPage/index.tsx`
- [ ] `src/components/ConversationContainer.tsx`
- [ ] `src/components/Sidebar.tsx`
- [ ] `src/components/StatusBar.tsx`
- [ ] `src/components/UI/Avatar.tsx`
- [ ] `src/components/settings/AppearanceSettings.tsx`

### 服务文件
- [ ] `src/services/contactService/data/db.ts`
- [ ] `src/services/contactService/mockImpl.ts`
- [ ] `src/services/contactService/tauriImpl.ts`
- [ ] `src/services/contactService/types.ts`

### Store文件
- [ ] `src/store/contact.ts`
- [ ] `src/store/notification.ts`

## 修复步骤

### 步骤1：更新导入语句

将所有直接导入具体类型文件的语句改为从 `@/types` 导入：

```typescript
// 修复前
import { Contact } from '@/types/contact';
import { Message } from '@/types/message';

// 修复后
import { Contact, Message } from '@/types';
```

### 步骤2：检查类型兼容性

确保导入的类型与使用方式兼容，特别是：
- 属性名称是否一致
- 可选属性是否正确
- 联合类型是否匹配

### 步骤3：更新工具函数导入

```typescript
// 修复前
import { parseMessageContent } from '@/types/utils';

// 修复后
import { parseMessageContent } from '@/types';
```

## 验证方法

运行类型检查确认修复成功：

```bash
npx tsc --noEmit
```

## 注意事项

1. **保持向后兼容**：所有类型定义保持原有结构，只改变导入路径
2. **统一命名**：确保类型名称在整个项目中保持一致
3. **避免循环依赖**：新的模块化结构避免了循环依赖问题
4. **类型安全**：所有类型都有完整的TypeScript定义

## 常见问题

### Q: 为什么有些类型找不到？
A: 检查是否使用了正确的导入路径，所有类型现在都通过 `@/types` 导出。

### Q: 工具函数在哪里？
A: 工具函数现在在 `typeUtils.ts` 中，通过 `@/types` 统一导出。

### Q: 如何添加新类型？
A: 在对应的 `models/` 目录下添加类型定义，然后在 `models/index.ts` 中导出，最后在根 `index.ts` 中重新导出。

## 完成检查清单

- [ ] 所有组件文件导入路径已更新
- [ ] 所有服务文件导入路径已更新
- [ ] 所有store文件导入路径已更新
- [ ] 类型检查通过
- [ ] 功能测试通过 