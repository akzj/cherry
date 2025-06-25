# 联系人 Store 使用指南

## 概述

联系人 Store 是一个基于 Zustand 的状态管理解决方案，用于管理联系人、群组和相关数据。它提供了完整的数据获取、搜索、错误处理和加载状态管理功能。

## 主要功能

### 1. 数据管理
- **联系人列表**: 管理所有联系人数据
- **联系人分组**: 按字母自动分组联系人
- **群组管理**: 管理创建的群组和加入的群组
- **搜索功能**: 实时搜索联系人和群组

### 2. 状态管理
- **加载状态**: 显示数据加载进度
- **错误处理**: 优雅处理错误状态
- **搜索状态**: 管理搜索查询和结果

### 3. API 集成
- **Tauri 集成**: 通过 `invoke` 调用后端 API
- **自动刷新**: 支持数据自动刷新
- **错误重试**: 提供错误重试机制

## 使用方法

### 基本使用

```typescript
import { useContactStore } from '../store/contact';

const ContactPage = () => {
  const {
    contacts,
    contactGroups,
    ownedGroups,
    joinedGroups,
    isLoading,
    error,
    searchQuery,
    refreshContacts,
    refreshGroups,
    searchContacts,
    setSearchQuery
  } = useContactStore();

  // 组件挂载时加载数据
  useEffect(() => {
    refreshContacts();
  }, [refreshContacts]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchContacts(query);
  };

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={refreshContacts} />}
      {contactGroups.map(group => (
        <ContactGroup key={group.id} group={group} />
      ))}
    </div>
  );
};
```

### 状态访问

```typescript
// 获取当前状态
const state = useContactStore.getState();

// 直接设置状态
useContactStore.getState().setContacts(newContacts);
useContactStore.getState().setLoading(true);
useContactStore.getState().setError('Error message');
```

### API 方法

```typescript
// 刷新联系人
await refreshContacts();

// 刷新群组
await refreshGroups();

// 搜索联系人
await searchContacts('search query');

// 创建群组
await createGroup({
  name: '新群组',
  avatar: 'avatar_url',
  memberCount: 0,
  isOwner: true
});

// 加入群组
await joinGroup('group_id');

// 离开群组
await leaveGroup('group_id');
```

## 数据结构

### Contact 接口
```typescript
interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastActive?: Date;
}
```

### ContactGroup 接口
```typescript
interface ContactGroup {
  id: string;
  title: string; // 分组标题（如字母 A、B、C 等）
  contacts: Contact[];
}
```

### Group 接口
```typescript
interface Group {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  isOwner: boolean;
}
```

## 错误处理

Store 提供了完整的错误处理机制：

```typescript
const { error, setError } = useContactStore();

// 设置错误
setError('Failed to load contacts');

// 清除错误
setError(null);

// 在组件中显示错误
{error && (
  <ErrorMessage
    title="加载失败"
    message={error}
    onRetry={refreshContacts}
  />
)}
```

## 加载状态

```typescript
const { isLoading, setLoading } = useContactStore();

// 显示加载状态
{isLoading && <LoadingSpinner text="加载中..." />}
```

## 搜索功能

```typescript
const { searchQuery, searchContacts } = useContactStore();

// 处理搜索输入
const handleSearchChange = (query: string) => {
  searchContacts(query);
};

// 清空搜索
const clearSearch = () => {
  searchContacts('');
};
```

## 最佳实践

1. **组件挂载时加载数据**: 在 `useEffect` 中调用相应的刷新方法
2. **错误处理**: 始终检查错误状态并提供重试机制
3. **加载状态**: 在数据加载时显示加载指示器
4. **搜索防抖**: 对于实时搜索，考虑添加防抖机制
5. **状态同步**: 确保组件状态与 store 状态保持同步

## 注意事项

- 所有 API 调用都是异步的，需要适当的错误处理
- 搜索功能会自动按字母分组结果
- 群组数据分为"创建的群组"和"加入的群组"两类
- 状态更新是响应式的，组件会自动重新渲染 