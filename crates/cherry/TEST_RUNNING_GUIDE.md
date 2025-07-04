# 测试运行指南

本文档说明如何运行 `src/test-message-parsing.ts` 测试文件。

## 运行方式

### 1. 使用 npm 脚本（推荐）

```bash
npm run test:parsing
```

这是最简单的方式，会自动运行所有测试用例。

### 2. 直接使用 tsx

```bash
npx tsx src/test-message-parsing.ts
```

如果你没有安装 tsx，这个命令会自动下载并运行。

### 3. 在浏览器中运行

1. 打开 `test-runner.html` 文件
2. 点击"运行测试"按钮
3. 查看测试结果

## 测试内容

测试文件包含以下12个测试用例：

1. **纯文本消息** - 测试简单的文本内容
2. **图片消息** - 测试图片URL和描述
3. **音频消息** - 测试音频文件和时长
4. **视频消息** - 测试视频文件和元数据
5. **文件消息** - 测试文件下载和大小
6. **系统消息** - 测试系统通知
7. **表情消息** - 测试emoji表情
8. **代码消息** - 测试代码块和语法高亮
9. **位置消息** - 测试地理位置信息
10. **联系人消息** - 测试联系人卡片
11. **事件消息** - 测试事件通知
12. **自定义消息** - 测试自定义内容类型

## 测试结果

成功的测试会显示：
- ✅ 测试名称
- 解析结果（JSON格式）
- 📊 测试统计
- 🎉 成功消息

失败的测试会显示：
- ❌ 测试名称
- 期望结果
- 实际结果
- 错误信息

## 示例输出

```
🧪 开始测试消息内容解析功能...

✅ 1. 纯文本消息
   结果: {
  "type": "text",
  "text": "Hello, World!"
}

✅ 2. 图片消息
   结果: {
  "type": "image",
  "text": "这是一张图片",
  "imageUrl": "https://example.com/image.jpg"
}

...

📊 测试结果: 12 通过, 0 失败
🎉 所有测试通过！
```

## 故障排除

### 如果遇到模块导入错误

确保你的项目支持 ES 模块：

1. 检查 `package.json` 中是否有 `"type": "module"`
2. 确保使用 `.ts` 扩展名导入

### 如果遇到 TypeScript 错误

运行构建命令来检查类型：

```bash
npm run build
```

### 如果需要调试

可以在测试文件中添加更多的 `console.log` 语句来调试特定的测试用例。

## 扩展测试

如果你想添加新的测试用例：

1. 在 `testCases` 数组中添加新的测试对象
2. 包含 `name`、`content`、`type` 和 `expected` 字段
3. 运行测试验证结果

```typescript
{
  name: '新的测试用例',
  content: { /* 测试内容 */ },
  type: 'message_type',
  expected: { /* 期望结果 */ }
}
```

## 性能测试

如果你需要测试解析性能，可以添加性能测试：

```typescript
const startTime = performance.now();
parseMessageContent(content, type);
const endTime = performance.now();
console.log(`解析耗时: ${endTime - startTime}ms`);
``` 