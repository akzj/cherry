# 消息接收功能实现指南

## 概述

本文档描述了在前端实现消息/事件接收功能的完整实现，包括消息与会话的关联。

## 当前状态

### ✅ 已完成的功能

1. **消息存储系统** (`src/store/message.ts`)
   - 使用 Zustand 状态管理
   - 支持按会话ID组织消息
   - 提供添加、更新、清空消息的方法

2. **消息接收 Hook** (`src/hooks/useMessageReceiver.ts`)
   - 监听后端发送的 `cherry-message` 事件
   - 处理 `Message` 和 `Event` 两种消息类型
   - 自动转换后端消息格式为前端格式
   - **新增**: 使用后端提供的 `conversation_id` 直接关联消息和会话

3. **类型系统更新** (`src/types/types.ts`)
   - 更新了 `CherryMessage` 类型以匹配后端格式
   - 支持消息与会话的直接关联
   - 实现了消息格式转换函数

4. **测试组件** (`src/components/MessageTest.tsx`)
   - 提供直观的测试界面
   - 支持手动添加测试消息
   - 实时显示消息状态

5. **实时消息接收** ✅ **已修复**
   - 使用 Tauri v2 的正确 Channel API
   - 支持实时接收后端消息
   - 完整的消息流程已实现
   - **新增**: 消息自动关联到正确的会话

## 实现的功能

### 1. 消息存储 (Message Store)
- 位置: `src/store/message.ts`
- 功能: 管理所有会话的消息状态
- 主要方法:
  - `addMessage`: 添加新消息到指定会话
  - `addMessages`: 批量添加消息
  - `updateMessage`: 更新消息状态
  - `clearMessages`: 清空会话消息
  - `getMessages`: 获取会话消息列表

### 2. 消息接收 Hook
- 位置: `src/hooks/useMessageReceiver.ts`
- 功能: 监听后端发送的 `cherry-message` 事件
- 处理的消息类型:
  - `Message`: 普通聊天消息（包含 `conversation_id`）
  - `Event`: 流事件（会话创建、成员变更等）

### 3. 类型定义更新
- 位置: `src/types/types.ts`
- 更新类型:
  - `CherryMessage`: 新的消息格式，支持会话关联
  - `BackendMessage`: 后端消息格式
  - `StreamEvent`: 流事件类型
  - `convertBackendMessage`: 消息格式转换函数

### 4. 测试组件
- 位置: `src/components/MessageTest.tsx`
- 功能: 提供消息接收功能的测试界面
- 特性:
  - 显示当前会话和消息数量
  - 手动添加测试消息
  - 清空消息功能
  - 实时显示接收到的消息

## 使用方法

### 1. 启动应用
```bash
cd crates/cherry
npm run tauri dev
```

### 2. 登录测试
- 使用测试账户登录
- 登录成功后会自动开始接收消息

### 3. 测试消息接收
- 在应用界面中可以看到 "消息接收测试" 区域
- 可以手动添加测试消息验证功能
- 观察消息是否正确显示在消息列表中

### 4. 后端消息测试
- 后端会通过流服务器发送消息到前端
- 前端会自动接收并显示这些消息
- 可以在浏览器控制台查看接收到的消息日志

## 消息流程

1. **后端发送**: 后端通过 `on_event.send(CherryMessage::Message { message, conversation_id })` 发送消息
2. **前端接收**: `useMessageReceiver` hook 监听 `cherry-message` 事件
3. **消息处理**: 将后端消息格式转换为前端格式
4. **会话关联**: 使用后端提供的 `conversation_id` 直接关联消息和会话
5. **状态更新**: 通过 `useMessageStore` 更新消息状态
6. **UI 更新**: 消息列表自动更新显示新消息

## 重要修复

### Channel 导入问题修复 ✅

**问题**: `@tauri-apps/api/event` 模块没有导出 `Channel` 类

**原因**: Tauri v2 中 API 结构发生了变化

**解决方案**: 
1. 从 `@tauri-apps/api/core` 导入 `Channel`
2. 使用正确的 Tauri v2 API 语法
3. 重新实现实时消息接收功能

```typescript
// 正确的导入方式
import { invoke, Channel } from '@tauri-apps/api/core';

// 创建事件通道
const onEvent = new Channel<CherryMessage>();

// 设置事件监听器
onEvent.onmessage = (message) => {
  console.log('Received message from backend:', message);
  // 触发全局事件，供其他组件监听
  window.dispatchEvent(new CustomEvent('cherry-message', { detail: message }));
};

// 调用Tauri命令进行登录，传递事件通道
const userInfo = await invoke('cmd_login', { 
  email, 
  password,
  onEvent 
});
```

### 消息与会话关联修复 ✅

**问题**: 前端无法正确关联消息和会话

**原因**: 后端消息格式不包含会话信息

**解决方案**: 
1. 更新后端 `CherryMessage` 格式，包含 `conversation_id`
2. 前端使用后端提供的 `conversation_id` 直接关联消息
3. 移除前端的会话推断逻辑

```typescript
// 新的消息处理逻辑
if ('Message' in cherryMessage) {
  const { message: backendMessage, conversation_id } = cherryMessage.Message;
  const frontendMessage = convertBackendMessage(backendMessage);
  
  // 直接使用后端提供的 conversation_id
  addMessage(conversation_id, frontendMessage);
}
```

## 注意事项

1. **消息去重**: 当前实现使用后端提供的消息ID，避免重复显示
2. **会话同步**: 确保前端会话列表与后端保持同步
3. **错误处理**: 需要添加更完善的错误处理机制
4. **性能优化**: 对于大量消息需要考虑分页和虚拟滚动

## 下一步改进

1. 实现消息发送状态（已发送、已送达、已读等）
2. 添加消息撤回功能
3. 实现消息搜索功能
4. 添加消息加密功能
5. 实现离线消息同步
6. 添加消息分页加载

## 调试技巧

1. 打开浏览器开发者工具查看控制台日志
2. 使用 MessageTest 组件进行功能测试
3. 检查网络请求确认后端连接正常
4. 查看 Redux DevTools 了解状态变化
5. 使用 `window.testMessageReceiving()` 进行快速测试

## 测试脚本

在浏览器控制台中运行以下命令进行快速测试：

```javascript
// 导入测试函数
import('./test-send-message.ts').then(module => {
  module.testSendMessage();
});

// 或者直接调用（如果已挂载到全局）
window.testSendMessage();
```

## 技术实现细节

### Channel 使用方式

在 Tauri v2 中，`Channel` 的正确使用方式如下：

```typescript
import { invoke, Channel } from '@tauri-apps/api/core';

// 定义事件类型
type MyEvent = {
  event: 'started' | 'progress' | 'finished';
  data: any;
};

// 创建通道
const onEvent = new Channel<MyEvent>();

// 设置监听器
onEvent.onmessage = (message) => {
  console.log(`got event ${message.event}`);
};

// 调用命令
await invoke('my_command', { onEvent });
```

### 消息格式

新的消息格式支持会话关联：

```typescript
// 消息类型
type CherryMessage = 
  | { Message: { message: BackendMessage; conversation_id: string } }
  | { Event: { event: StreamEvent } };

// 使用示例
if ('Message' in cherryMessage) {
  const { message, conversation_id } = cherryMessage.Message;
  // 直接使用 conversation_id 关联消息和会话
  addMessage(conversation_id, convertBackendMessage(message));
}
```
