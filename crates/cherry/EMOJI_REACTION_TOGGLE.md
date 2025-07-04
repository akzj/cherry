# Emoji 反应切换功能

## 功能概述

emoji 反应切换功能允许用户通过点击 emoji 来添加或删除对消息的反应。如果用户已经对某个 emoji 做出过反应，再次点击会删除该反应；如果没有反应过，点击会添加反应。

## 实现逻辑

### 核心函数

```typescript
const handleReactionClick = (msg: Message, emoji: string) => {
  if (!conversationId) return;
  
  // 检查当前用户是否已经点击过这个 emoji
  const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
  const hasUserReacted = existingReaction?.users.includes(currentUserId);
  
  if (hasUserReacted) {
    // 如果用户已经点击过，则删除反应
    removeReaction(conversationId, msg.id, emoji, currentUserId);
  } else {
    // 如果用户没有点击过，则添加反应
    addReaction(conversationId, msg.id, emoji, currentUserId);
  }
};
```

### 工作流程

1. **检查现有反应** - 查找消息中是否已有该 emoji 的反应
2. **检查用户状态** - 检查当前用户是否在该 emoji 的用户列表中
3. **执行操作** - 根据用户状态决定添加或删除反应

## 数据结构

### Reaction 接口

```typescript
export interface Reaction {
  emoji: string;
  users: string[]; // userId 列表，可重复
}
```

### 消息中的反应

```typescript
export interface Message {
  // ... 其他字段
  reactions?: Reaction[];
}
```

## 使用场景

### 1. 用户第一次点击 emoji

**初始状态**：
```typescript
message.reactions = []
```

**用户操作**：点击 👍

**结果**：
```typescript
message.reactions = [
  { emoji: '👍', users: ['user1'] }
]
```

**UI 显示**：👍 1

### 2. 用户再次点击同一个 emoji

**初始状态**：
```typescript
message.reactions = [
  { emoji: '👍', users: ['user1', 'user2'] }
]
```

**用户操作**：user1 再次点击 👍

**结果**：
```typescript
message.reactions = [
  { emoji: '👍', users: ['user2'] }
]
```

**UI 显示**：👍 1

### 3. 用户点击不同的 emoji

**初始状态**：
```typescript
message.reactions = [
  { emoji: '👍', users: ['user1'] }
]
```

**用户操作**：点击 ❤️

**结果**：
```typescript
message.reactions = [
  { emoji: '👍', users: ['user1'] },
  { emoji: '❤️', users: ['user1'] }
]
```

**UI 显示**：👍 1 ❤️ 1

### 4. 多个用户对同一 emoji 反应

**初始状态**：
```typescript
message.reactions = [
  { emoji: '👍', users: ['user1'] }
]
```

**用户操作**：user2 点击 👍

**结果**：
```typescript
message.reactions = [
  { emoji: '👍', users: ['user1', 'user2'] }
]
```

**UI 显示**：👍 2

## 视觉反馈

### ReactionIcon 组件

```typescript
<ReactionIcon
  key={r.emoji + r.users.length}
  active={r.users.includes(currentUserId)}
  onClick={() => handleReactionClick(message, r.emoji)}
  title={r.emoji}
>
  {r.emoji} {r.users.length > 1 ? r.users.length : ''}
</ReactionIcon>
```

### 样式变化

- **active 状态**：用户已反应，显示高亮样式
- **非 active 状态**：用户未反应，显示普通样式
- **数量显示**：当反应数量 > 1 时显示数字

## 测试用例

### 测试覆盖场景

1. **用户第一次点击 emoji** - 验证添加反应
2. **用户再次点击同一个 emoji** - 验证删除反应
3. **用户点击不同的 emoji** - 验证添加新反应
4. **其他用户点击已有反应的 emoji** - 验证添加反应
5. **用户点击没有反应的消息** - 验证添加反应

### 运行测试

```bash
npm run test:reaction
```

## 后端集成

### 反应消息格式

添加反应时发送的消息：
```json
{
  "emoji": "👍",
  "users": "user1",
  "action": "add",
  "targetMessageId": 123
}
```

删除反应时发送的消息：
```json
{
  "emoji": "👍",
  "users": "user1",
  "action": "remove",
  "targetMessageId": 123
}
```

### 消息类型

反应消息使用 `type: 'reaction'` 类型，后端会处理这些消息并更新目标消息的反应状态。

## 性能考虑

### 优化点

1. **本地状态更新** - 立即更新 UI，不等待后端响应
2. **防重复点击** - 在请求期间禁用按钮
3. **批量更新** - 多个反应同时更新时合并请求

### 错误处理

1. **网络错误** - 回滚本地状态
2. **权限错误** - 显示错误提示
3. **数据不一致** - 重新同步消息状态

## 扩展功能

### 可能的增强

1. **反应统计** - 显示每种反应的详细统计
2. **反应历史** - 查看谁在什么时候做出了反应
3. **自定义反应** - 支持自定义 emoji 或图片
4. **反应通知** - 当消息收到反应时通知用户

## 注意事项

1. **并发处理** - 多个用户同时反应时的状态同步
2. **数据一致性** - 确保前端状态与后端数据一致
3. **用户体验** - 提供即时的视觉反馈
4. **性能优化** - 避免频繁的 DOM 更新

## 总结

emoji 反应切换功能提供了直观的交互方式，让用户能够快速表达对消息的态度。通过智能的切换逻辑，避免了重复反应，提供了良好的用户体验。 