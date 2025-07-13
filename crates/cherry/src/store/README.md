# 状态管理层架构文档

## 📋 概述

状态管理层使用Zustand作为状态管理库，负责管理应用的全局状态和业务逻辑。采用模块化设计，每个功能域对应一个独立的Store，支持类型安全和开发工具集成。

## 🏗️ 架构设计

### 状态管理架构

```
┌─────────────────────────────────────────────────────────────┐
│                     State Management                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Auth      │  │  Contact    │  │Conversation │         │
│  │   Store     │  │  Store      │  │  Store      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Notification │  │ReadPosition │  │   Other     │         │
│  │  Store      │  │  Store      │  │  Stores     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │   Service   │  │   Actions   │  │   Middleware    │     │
│  │   Layer     │  │  (Methods)  │  │   (DevTools)    │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 设计原则

1. **单一职责**: 每个Store只负责一个功能域
2. **不可变性**: 状态更新遵循不可变原则
3. **类型安全**: 完整的TypeScript类型定义
4. **可测试性**: 支持单元测试和集成测试
5. **开发友好**: 集成Redux DevTools

## 📁 目录结构

```
store/
├── README.md                 # 本文档
├── auth.ts                  # 认证状态管理
├── contact.ts               # 联系人状态管理
├── conversation.ts          # 会话状态管理
├── notification.ts          # 通知状态管理
├── readPosition.ts          # 阅读位置状态管理
└── index.ts                 # 统一导出入口
```

## 🔧 Store规范

### 标准Store结构

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import type { StoreState, StoreActions } from '@/types';

// 状态接口
interface StoreState {
  // 状态定义
  data: DataType[];
  loading: boolean;
  error: string | null;
}

// 操作接口
interface StoreActions {
  // 操作方法
  fetchData: () => Promise<void>;
  addData: (item: DataType) => void;
  updateData: (id: string, updates: Partial<DataType>) => void;
  deleteData: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Store类型
type Store = StoreState & StoreActions;

// 初始状态
const initialState: StoreState = {
  data: [],
  loading: false,
  error: null,
};

// 创建Store
export const useStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // 操作方法实现
        fetchData: async () => {
          set({ loading: true, error: null });
          try {
            const data = await service.fetchData();
            set({ data, loading: false });
          } catch (error) {
            set({ 
              error: error.message, 
              loading: false 
            });
          }
        },
        
        addData: (item) => {
          set((state) => ({
            data: [...state.data, item]
          }));
        },
        
        updateData: (id, updates) => {
          set((state) => ({
            data: state.data.map(item =>
              item.id === id ? { ...item, ...updates } : item
            )
          }));
        },
        
        deleteData: (id) => {
          set((state) => ({
            data: state.data.filter(item => item.id !== id)
          }));
        },
        
        setLoading: (loading) => {
          set({ loading });
        },
        
        setError: (error) => {
          set({ error });
        },
      }),
      {
        name: 'store-name', // 持久化键名
        partialize: (state) => ({
          // 只持久化特定字段
          data: state.data,
        }),
      }
    ),
    {
      name: 'StoreName', // DevTools显示名称
    }
  )
);
```

### 状态选择器

```typescript
// 基础选择器
export const useData = () => useStore((state) => state.data);
export const useLoading = () => useStore((state) => state.loading);
export const useError = () => useStore((state) => state.error);

// 派生选择器
export const useDataById = (id: string) => 
  useStore((state) => state.data.find(item => item.id === id));

export const useDataCount = () => 
  useStore((state) => state.data.length);

// 组合选择器
export const useDataWithLoading = () => 
  useStore((state) => ({
    data: state.data,
    loading: state.loading,
    error: state.error,
  }));
```

## 📊 Store详情

### AuthStore - 认证状态

**职责**: 管理用户认证状态、Token、用户信息

**状态**:
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

**操作**:
```typescript
interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
}
```

**使用示例**:
```typescript
const { user, isAuthenticated, login, logout } = useAuthStore();

// 登录
await login('user@example.com', 'password');

// 检查认证状态
if (isAuthenticated) {
  console.log('User:', user);
}

// 登出
logout();
```

### ContactStore - 联系人状态

**职责**: 管理联系人列表、群组、搜索状态

**状态**:
```typescript
interface ContactState {
  contacts: Contact[];
  groups: Group[];
  searchQuery: string;
  searchResults: Contact[];
  loading: boolean;
  error: string | null;
}
```

**操作**:
```typescript
interface ContactActions {
  fetchContacts: () => Promise<void>;
  searchContacts: (query: string) => Promise<void>;
  createGroup: (groupData: GroupData) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}
```

**使用示例**:
```typescript
const { 
  contacts, 
  groups, 
  searchContacts, 
  createGroup 
} = useContactStore();

// 搜索联系人
await searchContacts('john');

// 创建群组
await createGroup({
  name: 'My Group',
  members: ['user1', 'user2']
});
```

### ConversationStore - 会话状态

**职责**: 管理会话列表、当前会话、消息状态

**状态**:
```typescript
interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}
```

**操作**:
```typescript
interface ConversationActions {
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => void;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, type?: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
}
```

**使用示例**:
```typescript
const { 
  conversations, 
  currentConversation, 
  messages,
  selectConversation,
  sendMessage 
} = useConversationStore();

// 选择会话
selectConversation('conv-123');

// 发送消息
await sendMessage('Hello World');
```

### NotificationStore - 通知状态

**职责**: 管理通知列表、未读数量、通知设置

**状态**:
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  loading: boolean;
}
```

**操作**:
```typescript
interface NotificationActions {
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}
```

**使用示例**:
```typescript
const { 
  notifications, 
  unreadCount, 
  addNotification,
  markAsRead 
} = useNotificationStore();

// 添加通知
addNotification({
  id: 'notif-1',
  title: 'New Message',
  message: 'You have a new message',
  type: 'info'
});

// 标记为已读
markAsRead('notif-1');
```

### ReadPositionStore - 阅读位置状态

**职责**: 管理消息阅读位置、滚动位置

**状态**:
```typescript
interface ReadPositionState {
  positions: Record<string, number>; // conversationId -> messageId
  scrollPositions: Record<string, number>; // conversationId -> scrollTop
}
```

**操作**:
```typescript
interface ReadPositionActions {
  setReadPosition: (conversationId: string, messageId: number) => void;
  getReadPosition: (conversationId: string) => number;
  setScrollPosition: (conversationId: string, scrollTop: number) => void;
  getScrollPosition: (conversationId: string) => number;
  clearPositions: (conversationId?: string) => void;
}
```

## 🔄 状态更新模式

### 异步操作模式

```typescript
// 异步操作模板
const asyncAction = async (params: any) => {
  set({ loading: true, error: null });
  try {
    const result = await service.action(params);
    set({ data: result, loading: false });
  } catch (error) {
    set({ 
      error: error.message, 
      loading: false 
    });
  }
};
```

### 乐观更新模式

```typescript
// 乐观更新模板
const optimisticUpdate = (id: string, updates: any) => {
  // 立即更新UI
  set((state) => ({
    data: state.data.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
  }));
  
  // 异步同步到服务器
  service.update(id, updates).catch((error) => {
    // 回滚更新
    set((state) => ({
      data: state.data.map(item =>
        item.id === id ? { ...item, ...originalData } : item
      ),
      error: error.message
    }));
  });
};
```

### 批量更新模式

```typescript
// 批量更新模板
const batchUpdate = (updates: Update[]) => {
  set((state) => {
    const newData = [...state.data];
    updates.forEach(({ id, changes }) => {
      const index = newData.findIndex(item => item.id === id);
      if (index !== -1) {
        newData[index] = { ...newData[index], ...changes };
      }
    });
    return { data: newData };
  });
};
```

## 🛠️ 开发指南

### 创建新Store

1. **创建Store文件**:
```bash
touch src/store/newStore.ts
```

2. **定义状态接口**:
```typescript
interface NewStoreState {
  data: DataType[];
  loading: boolean;
  error: string | null;
}
```

3. **定义操作接口**:
```typescript
interface NewStoreActions {
  fetchData: () => Promise<void>;
  addData: (item: DataType) => void;
  updateData: (id: string, updates: Partial<DataType>) => void;
  deleteData: (id: string) => void;
}
```

4. **实现Store**:
```typescript
export const useNewStore = create<NewStoreState & NewStoreActions>()(
  devtools(
    persist(
      (set, get) => ({
        data: [],
        loading: false,
        error: null,
        
        fetchData: async () => {
          set({ loading: true });
          try {
            const data = await service.fetchData();
            set({ data, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },
        
        addData: (item) => {
          set((state) => ({
            data: [...state.data, item]
          }));
        },
        
        updateData: (id, updates) => {
          set((state) => ({
            data: state.data.map(item =>
              item.id === id ? { ...item, ...updates } : item
            )
          }));
        },
        
        deleteData: (id) => {
          set((state) => ({
            data: state.data.filter(item => item.id !== id)
          }));
        },
      }),
      {
        name: 'new-store',
      }
    ),
    {
      name: 'NewStore',
    }
  )
);
```

5. **创建选择器**:
```typescript
export const useNewData = () => useNewStore((state) => state.data);
export const useNewLoading = () => useNewStore((state) => state.loading);
export const useNewError = () => useNewStore((state) => state.error);
```

### Store测试

```typescript
import { renderHook, act } from '@testing-library/react';
import { useNewStore } from './newStore';

describe('NewStore', () => {
  beforeEach(() => {
    // 重置Store状态
    useNewStore.setState({
      data: [],
      loading: false,
      error: null,
    });
  });

  it('should add data', () => {
    const { result } = renderHook(() => useNewStore());
    
    act(() => {
      result.current.addData({ id: '1', name: 'Test' });
    });
    
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].name).toBe('Test');
  });

  it('should handle async operations', async () => {
    const { result } = renderHook(() => useNewStore());
    
    await act(async () => {
      await result.current.fetchData();
    });
    
    expect(result.current.loading).toBe(false);
  });
});
```

### 性能优化

```typescript
// 使用浅比较优化渲染
export const useOptimizedData = () => 
  useStore(
    (state) => state.data,
    (prev, next) => prev.length === next.length
  );

// 使用useMemo缓存派生状态
export const useFilteredData = (filter: string) => {
  const data = useStore((state) => state.data);
  return useMemo(() => 
    data.filter(item => item.name.includes(filter)),
    [data, filter]
  );
};
```

## 🔮 扩展性

### 中间件系统
- 日志中间件
- 持久化中间件
- 同步中间件

### 插件系统
- 自定义中间件
- 状态监听器
- 开发工具插件

### 状态同步
- 跨标签页同步
- 服务端同步
- 离线同步

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 