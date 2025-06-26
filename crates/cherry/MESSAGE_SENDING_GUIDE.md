# 消息发送功能使用指南

## 概述

本文档介绍如何测试和使用消息发送功能。消息发送功能已经修复，现在可以正常工作了。

## 修复的问题

1. **会话ID查找问题**: 修复了后端 `cmd_send_message` 中会话ID的UUID转换问题
2. **前端测试组件**: 改进了 `MessageTest` 组件，支持通过后端API发送消息
3. **错误处理**: 添加了更好的错误处理和状态反馈

## 测试方法

### 方法1: 使用Tauri应用内的测试组件

1. 启动Tauri应用：
   ```bash
   cd crates/cherry
   npm run tauri dev
   ```

2. 登录后，在应用界面中会看到 "消息发送测试" 组件
3. 选择或等待会话加载完成
4. 使用测试组件发送消息：
   - **发送消息**: 输入消息内容，点击"发送消息"
   - **添加本地消息**: 只在本地添加消息，不发送到后端
   - **清空消息**: 清空当前会话的消息

### 方法2: 使用HTML测试页面

1. 确保Tauri应用正在运行
2. 在浏览器中打开 `test_message_sending.html`
3. 页面会自动加载会话信息
4. 使用各种测试功能：
   - 基础消息发送测试
   - 回复消息测试
   - 错误情况测试
   - 批量测试

### 方法3: 使用JavaScript测试脚本

1. 在Tauri应用的开发者工具控制台中运行：
   ```javascript
   // 加载测试脚本
   const testScript = await import('./test_message_sending.js');
   
   // 运行所有测试
   await testScript.runAllTests();
   
   // 或者运行单个测试
   await testScript.testSendMessage();
   ```

## 功能特性

### 支持的消息类型

- **文本消息**: 普通文本内容
- **表情消息**: 包含emoji的消息
- **长消息**: 长文本内容
- **回复消息**: 回复特定消息

### 错误处理

- 无效的会话ID
- 空消息内容
- 网络连接错误
- 服务器错误

### 状态反馈

- 发送成功/失败状态
- 实时日志记录
- 错误详细信息

## 技术实现

### 后端实现

```rust
#[tauri::command]
async fn cmd_send_message(
    conversation_id: String,
    content: String,
    message_type: Option<String>,
    reply_to: Option<i64>,
    state: State<'_, AppState>,
) -> Result<(), CommandError> {
    // 将字符串转换为UUID
    let conversation_uuid = Uuid::parse_str(&conversation_id)
        .map_err(|e| CommandError {
            message: format!("Invalid conversation ID format: {}", e),
        })?;

    // 查找会话
    let stream_id = {
        let conversations = state.conversations.lock().unwrap();
        let conversation = conversations
            .iter()
            .find(|c| c.conversation_id == conversation_uuid)
            .ok_or_else(|| CommandError {
                message: format!("Conversation not found: {}", conversation_id),
            })?;
        conversation.stream_id
    };

    // 创建并发送消息
    let message = Message {
        id: 0,
        user_id: state.user_info.lock().unwrap().as_ref().unwrap().user_id,
        content,
        timestamp: chrono::Utc::now(),
        reply_to,
        type_: message_type.unwrap_or_else(|| "text".to_string()),
    };

    let stream_client = state.get_stream_client()?;
    let encoded_data = message.encode().map_err(CommandError::from)?;
    let response = stream_client.append_stream(stream_id, encoded_data).await?;

    log::info!("Message sent successfully, offset: {}", response.offset);
    Ok(())
}
```

### 前端实现

```typescript
// 消息发送函数
const sendMessage = async (conversationId: string, content: string, messageType?: string, replyTo?: number) => {
  try {
    await invoke('cmd_send_message', {
      conversationId,
      content,
      messageType: messageType || 'text',
      replyTo
    });
    
    // 添加临时消息到本地状态
    const tempMessage: Message = {
      id: Date.now(),
      userId: 'current_user',
      content,
      timestamp: new Date().toISOString(),
      type: (messageType || 'text') as Message['type']
    };
    
    addMessage(conversationId, tempMessage);
    
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};
```

## 测试用例

### 基础测试

1. **普通文本消息**
   ```javascript
   await invoke('cmd_send_message', {
     conversationId: 'conversation-uuid',
     content: 'Hello, world!',
     messageType: 'text'
   });
   ```

2. **表情消息**
   ```javascript
   await invoke('cmd_send_message', {
     conversationId: 'conversation-uuid',
     content: 'Hello with emoji! 😊 🎉',
     messageType: 'text'
   });
   ```

3. **长消息**
   ```javascript
   const longMessage = 'This is a long message...'.repeat(10);
   await invoke('cmd_send_message', {
     conversationId: 'conversation-uuid',
     content: longMessage,
     messageType: 'text'
   });
   ```

### 回复消息测试

```javascript
// 发送回复消息
await invoke('cmd_send_message', {
  conversationId: 'conversation-uuid',
  content: 'This is a reply',
  messageType: 'text',
  replyTo: 1  // 回复消息ID为1的消息
});
```

### 错误测试

1. **无效会话ID**
   ```javascript
   try {
     await invoke('cmd_send_message', {
       conversationId: 'invalid-uuid',
       content: 'This should fail',
       messageType: 'text'
     });
   } catch (error) {
     console.log('Expected error:', error.message);
   }
   ```

2. **空消息内容**
   ```javascript
   try {
     await invoke('cmd_send_message', {
       conversationId: 'conversation-uuid',
       content: '',
       messageType: 'text'
     });
   } catch (error) {
     console.log('Expected error:', error.message);
   }
   ```

## 故障排除

### 常见问题

1. **"Conversation not found" 错误**
   - 确保用户已登录
   - 检查会话列表是否正确加载
   - 验证会话ID格式是否正确

2. **"Invalid conversation ID format" 错误**
   - 确保会话ID是有效的UUID格式
   - 检查前端传递的会话ID是否正确

3. **消息发送失败**
   - 检查网络连接
   - 验证JWT token是否有效
   - 查看后端日志获取详细错误信息

### 调试技巧

1. **启用详细日志**
   ```bash
   RUST_LOG=debug npm run tauri dev
   ```

2. **使用开发者工具**
   - 打开浏览器开发者工具
   - 查看控制台日志
   - 检查网络请求

3. **使用测试页面**
   - 打开 `test_message_sending.html`
   - 查看实时日志输出
   - 使用各种测试功能

## 下一步

1. **消息接收**: 确保发送的消息能够正确接收和显示
2. **消息历史**: 实现消息历史记录功能
3. **消息状态**: 添加消息发送状态（发送中、已发送、已读等）
4. **消息类型**: 支持更多消息类型（图片、文件、语音等）

## 相关文件

- `src-tauri/src/lib.rs` - 后端消息发送实现
- `src/components/MessageTest.tsx` - 前端测试组件
- `src/store/message.ts` - 消息状态管理
- `test_message_sending.html` - HTML测试页面
- `test_message_sending.js` - JavaScript测试脚本 