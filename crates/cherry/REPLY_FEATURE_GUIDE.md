# 回复功能使用指南

## 功能概述

Cherry Chat 现在支持消息回复功能，允许用户回复特定的消息，创建更清晰的对话上下文。

## 功能特性

### 1. 回复消息
- 点击消息右上角的回复按钮来回复特定消息
- 回复的消息会在输入框上方显示预览
- 可以取消回复操作

### 2. 回复显示
- 回复的消息会在消息气泡中显示被回复消息的预览
- 回复消息有特殊的视觉标识（左边框高亮）
- 显示被回复消息的用户名和内容摘要

### 3. 状态管理
- 回复状态在全局消息 store 中管理
- 发送消息后自动清除回复状态
- 支持跨会话的回复状态

## 使用方法

### 回复消息
1. 在消息列表中，将鼠标悬停在任意消息上
2. 点击出现的回复按钮（↩️ 图标）
3. 输入框上方会显示回复预览
4. 输入回复内容并发送
5. 回复消息会显示在对话中，并包含被回复消息的引用

### 取消回复
- 点击回复预览右上角的 ✕ 按钮
- 或者直接发送消息后自动清除

## 技术实现

### 前端组件
- `ReplyMessage.tsx` - 回复消息预览组件
- `MessageList.tsx` - 消息列表，包含回复按钮
- `MessageInput.tsx` - 消息输入，支持回复状态
- `message.ts` store - 管理回复状态

### 数据结构
```typescript
interface Message {
  id: number;
  userId: string;
  content: string;
  timestamp: string;
  reply_to?: number;           // 被回复的消息ID
  replyToMessage?: Message;    // 被回复的消息对象
  isReply?: boolean;          // 是否是回复消息
}
```

### 状态管理
```typescript
interface MessageState {
  replyingTo: Message | null;  // 当前正在回复的消息
  setReplyingTo: (message: Message | null) => void;
  getMessageById: (conversationId: string, messageId: number) => Message | undefined;
}
```

## 测试功能

### 测试脚本
```typescript
// 测试发送回复消息
await testSendReplyMessage();

// 测试发送带回复的消息序列
await testSendMessageWithReply();
```

### 手动测试
1. 打开浏览器开发者工具
2. 在控制台中运行：
   ```javascript
   // 发送普通消息
   await window.testSendMessage();
   
   // 发送回复消息
   await window.testSendReplyMessage();
   ```

## 样式定制

### 回复消息样式
- 回复预览：蓝色边框和背景
- 回复按钮：悬停时显示的操作按钮
- 回复指示器：消息气泡中的回复引用

### 自定义样式
可以通过修改 styled-components 来自定义回复功能的视觉效果：

```typescript
const ReplyContainer = styled.div`
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid #6366f1;
  // 自定义样式...
`;
```

## 注意事项

1. **消息ID**: 确保被回复的消息ID存在且有效
2. **状态同步**: 回复状态在组件间正确同步
3. **错误处理**: 处理回复消息发送失败的情况
4. **性能**: 大量消息时回复功能的性能优化

## 未来扩展

- 支持回复消息的嵌套显示
- 添加回复消息的通知功能
- 支持回复消息的搜索和过滤
- 添加回复消息的统计信息 