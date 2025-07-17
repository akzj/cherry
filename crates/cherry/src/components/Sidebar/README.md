# Sidebar 组件结构

## 概述
Sidebar 组件已被重构为模块化的结构，拆分为多个小组件，每个组件负责特定的功能。

## 目录结构
```
src/components/Sidebar/
├── index.tsx              # 主 Sidebar 组件
├── Header.tsx             # 头部组件（搜索框和操作按钮）
├── MainNavigation.tsx     # 主导航栏组件
├── SecondaryNavigation.tsx # 二级导航组件
├── EmptyState.tsx         # 空状态组件
└── README.md             # 此文件
```

## 组件说明

### 1. Header.tsx
**功能**: 包含搜索框和操作按钮
**Props**:
- `searchQuery`: 搜索查询字符串
- `onSearchChange`: 搜索变化回调
- `onOpenContacts`: 打开联系人回调
- `onOpenSettings`: 打开设置回调

### 2. MainNavigation.tsx
**功能**: 主导航栏，包含消息、联系人、书签等主要功能入口
**Props**:
- `activeMainNav`: 当前激活的主导航
- `onNavChange`: 导航变化回调
- `onOpenSettings`: 打开设置回调
- `unreadCount`: 未读消息数量
- `mentionCount`: 提及数量

### 3. SecondaryNavigation.tsx
**功能**: 二级导航，包含会话分类（全部、未读、@我、单聊、群聊）
**Props**:
- `activeTab`: 当前激活的标签
- `onTabChange`: 标签变化回调
- `unreadCount`: 未读消息数量
- `mentionCount`: 提及数量
- `totalCount`: 总会话数量

### 4. EmptyState.tsx
**功能**: 空状态显示，根据不同的标签显示不同的空状态内容
**Props**:
- `activeTab`: 当前激活的标签

### 5. index.tsx
**功能**: 主 Sidebar 组件，整合所有子组件
**Props**:
- `conversations`: 会话列表
- `currentUser`: 当前用户
- `onSelectConversation`: 选择会话回调
- `onOpenSettings`: 打开设置回调
- `activeMainNav`: 当前激活的主导航
- `setActiveMainNav`: 设置主导航回调

## 类型定义

### MainNavType
```typescript
type MainNavType = 'messages' | 'contacts';
```

### TabType
```typescript
type TabType = 'all' | 'unread' | 'mentions' | 'direct' | 'group';
```

## 使用方式

由于重构后的组件结构，原有的导入方式保持不变：

```typescript
import Sidebar from '@/components/Sidebar';
import { MainNavType, TabType } from '@/components/Sidebar';
```

## 重构优势

1. **模块化**: 每个组件职责单一，易于维护
2. **可复用**: 各个子组件可以独立复用
3. **可测试**: 单个组件更容易进行单元测试
4. **可扩展**: 新增功能时只需要修改对应的子组件
5. **代码分离**: 样式和逻辑分离，结构更清晰

## 向后兼容性

重构后的组件完全向后兼容，所有原有的 API 和接口保持不变。外部组件无需修改即可使用新的模块化结构。
