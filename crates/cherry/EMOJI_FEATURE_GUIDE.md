# 表情输入功能使用指南

## 功能概述

Cherry Chat 现在支持表情输入功能，使用 [emoji-mart](https://github.com/missive/emoji-mart) 第三方库提供丰富的表情选择体验。

## 功能特性

### 1. 表情选择器
- 基于 emoji-mart 的现代化表情选择器
- 支持搜索表情功能
- 分类浏览（常用、人物、自然、食物、活动、地点、物品、符号、旗帜）
- 支持肤色选择
- 深色主题适配

### 2. 输入集成
- 点击表情按钮打开选择器
- 选择表情后自动插入到输入框
- 支持在任意位置插入表情
- 保持光标位置正确

### 3. 消息类型支持
- 支持纯表情消息
- 支持文字+表情混合消息
- 表情消息在消息列表中正确显示

## 使用方法

### 插入表情
1. 在消息输入框中点击表情按钮（😊 图标）
2. 表情选择器会弹出显示
3. 可以通过搜索或分类浏览找到想要的表情
4. 点击表情即可插入到输入框中
5. 可以继续输入文字或插入更多表情

### 搜索表情
- 在表情选择器的搜索框中输入关键词
- 支持中文和英文搜索
- 实时显示匹配结果

### 肤色选择
- 在表情选择器中选择肤色按钮
- 支持 6 种不同的肤色选项
- 选择后会影响后续选择的人物表情

## 技术实现

### 依赖库
```json
{
  "@emoji-mart/react": "^5.6.0",
  "@emoji-mart/data": "^5.6.0"
}
```

### 核心组件
- `EmojiPicker.tsx` - 表情选择器组件
- `MessageInput.tsx` - 集成了表情功能的输入组件

### 表情数据结构
```typescript
interface EmojiData {
  native: string;      // 原生表情字符
  unified: string;     // Unicode 统一码
  shortcodes: string;  // 短代码格式
}
```

### 样式定制
表情选择器已适配深色主题，包括：
- 深色背景和边框
- 半透明效果
- 模糊背景
- 悬停效果
- 圆角设计

## 配置选项

### EmojiPicker 配置
```typescript
<Picker
  data={data}                    // 表情数据
  theme="dark"                   // 深色主题
  set="native"                   // 使用原生表情
  skinTonePosition="search"      // 肤色选择器位置
  previewPosition="none"         // 隐藏预览
  searchPosition="sticky"        // 搜索框固定
  maxFrequentRows={4}           // 常用表情行数
  perLine={8}                   // 每行表情数量
  emojiSize={20}                // 表情大小
  emojiButtonSize={28}          // 表情按钮大小
  emojiButtonRadius={6}         // 表情按钮圆角
  searchPlaceholder="搜索表情..." // 搜索框占位符
  noResultsEmoji="🤔"           // 无结果表情
  noResultsText="没有找到表情"   // 无结果文本
/>
```

## 表情分类

表情选择器包含以下分类：
- **常用** - 最近使用的表情
- **人物** - 各种人物表情和手势
- **自然** - 动物、植物、天气等
- **食物** - 各种食物和饮料
- **活动** - 运动、游戏、娱乐等
- **地点** - 建筑、地标、交通工具等
- **物品** - 日常用品、工具等
- **符号** - 各种符号和标志
- **旗帜** - 世界各国旗帜

## 浏览器兼容性

emoji-mart 依赖以下现代浏览器 API：
- Shadow DOM
- Custom elements
- IntersectionObserver
- Async/Await

支持所有现代浏览器，包括：
- Chrome 67+
- Firefox 63+
- Safari 11.1+
- Edge 79+

## 性能优化

### 懒加载
- 表情数据按需加载
- 表情图片使用 CDN 加速

### 缓存
- 常用表情缓存
- 搜索索引缓存

### 渲染优化
- 虚拟滚动支持
- 表情图片预加载

## 自定义扩展

### 添加自定义表情
```typescript
const custom = [
  {
    id: 'custom',
    name: '自定义',
    emojis: [
      {
        id: 'custom_emoji',
        name: '自定义表情',
        keywords: ['custom'],
        skins: [{ src: './custom_emoji.png' }],
      },
    ],
  },
];

<Picker data={data} custom={custom} />
```

### 自定义分类图标
```typescript
const customCategoryIcons = {
  categoryIcons: {
    people: {
      svg: '<svg>...</svg>',
    },
  },
};

<Picker data={data} customCategoryIcons={customCategoryIcons} />
```

## 测试功能

### 手动测试
1. 打开应用
2. 点击消息输入框旁边的表情按钮
3. 测试表情搜索功能
4. 测试表情插入功能
5. 测试肤色选择功能
6. 测试发送包含表情的消息

### 自动化测试
```typescript
// 测试表情选择器打开
test('should open emoji picker when clicking emoji button', () => {
  // 测试代码
});

// 测试表情插入
test('should insert emoji into input field', () => {
  // 测试代码
});
```

## 故障排除

### 常见问题

1. **表情不显示**
   - 检查网络连接
   - 确认表情数据加载成功
   - 检查浏览器兼容性

2. **表情选择器无法打开**
   - 检查 z-index 设置
   - 确认没有其他元素遮挡
   - 检查事件处理函数

3. **表情插入位置错误**
   - 检查光标位置计算
   - 确认 textarea 引用正确
   - 检查异步操作时序

### 调试技巧
- 使用浏览器开发者工具检查 DOM 结构
- 查看控制台错误信息
- 检查网络请求状态
- 使用 React DevTools 调试组件状态

## 未来扩展

- 支持 GIF 表情
- 添加表情包功能
- 支持表情收藏
- 添加表情统计
- 支持表情推荐
- 添加表情动画效果 