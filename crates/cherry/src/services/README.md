# 服务层架构文档

## 📋 概述

服务层是Cherry应用的核心抽象层，负责封装所有与外部系统的交互，包括后端API、文件系统、网络通信等。采用依赖倒置原则，支持运行时切换实现。

## 🏗️ 架构设计

### 分层结构

```
┌─────────────────────────────────────────────────────────────┐
│                        Service Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Auth      │  │  Contact    │  │  Message    │         │
│  │  Service    │  │  Service    │  │  Service    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Conversation │  │   File      │  │   Event     │         │
│  │  Service    │  │  Service    │  │  Service    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Tauri      │  │   Mock      │  │   Index     │         │
│  │  Impl       │  │   Impl      │  │  (Router)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 设计原则

1. **接口隔离**: 每个服务都有明确的接口定义
2. **实现分离**: Tauri实现和Mock实现完全分离
3. **环境适配**: 根据运行环境自动选择实现
4. **错误处理**: 统一的错误处理机制
5. **类型安全**: 完整的TypeScript类型支持

## 📁 目录结构

```
services/
├── README.md                 # 本文档
├── authService/             # 认证服务
│   ├── types.ts            # 服务接口定义
│   ├── tauriImpl.ts        # Tauri实现
│   ├── mockImpl.ts         # Mock实现
│   └── index.ts            # 导出入口
├── contactService/          # 联系人服务
│   ├── types.ts
│   ├── tauriImpl.ts
│   ├── mockImpl.ts
│   ├── data/
│   │   └── db.ts          # Mock数据存储
│   └── index.ts
├── messageService/          # 消息服务
│   ├── types.ts
│   ├── tauriImpl.ts
│   ├── mockImpl.ts
│   ├── data/
│   │   ├── db.ts
│   │   └── setup-localstorage.ts
│   └── index.ts
├── conversationService/     # 会话服务
│   ├── types.ts
│   ├── tauriImpl.ts
│   ├── mockImpl.ts
│   └── index.ts
├── fileService/            # 文件服务
│   ├── types.ts
│   ├── tauriImpl.ts
│   ├── mockImpl.ts
│   └── index.ts
├── eventService/           # 事件服务
│   ├── types.ts
│   ├── tauriImpl.ts
│   ├── mockImpl.ts
│   ├── README.md
│   ├── __tests__/
│   ├── examples/
│   └── index.ts
├── windowService/          # 窗口服务
│   ├── types.ts
│   ├── tauriImpl.ts
│   ├── mockImpl.ts
│   └── index.ts
└── mock/                   # Mock基础设施
    └── LocalDbAdapter.ts   # 本地存储适配器
```

## 🔧 服务接口规范

### 标准服务结构

每个服务都遵循以下结构：

```typescript
// types.ts - 服务接口定义
export interface ServiceName {
  method1(): Promise<ReturnType1>;
  method2(param: ParamType): Promise<ReturnType2>;
  // ...
}

// tauriImpl.ts - Tauri实现
export const tauriServiceName: ServiceName = {
  method1: async () => {
    // 调用Tauri API
    return await invoke('cmd_method1');
  },
  // ...
};

// mockImpl.ts - Mock实现
export const mockServiceName: ServiceName = {
  method1: async () => {
    // 返回Mock数据
    return mockData;
  },
  // ...
};

// index.ts - 导出入口
import { tauriServiceName } from './tauriImpl';
import { mockServiceName } from './mockImpl';

const isTauriEnv = typeof window !== 'undefined' && window.__TAURI__;

export const serviceName = isTauriEnv ? tauriServiceName : mockServiceName;
```

### 错误处理规范

```typescript
// 统一错误类型
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
}

// 错误处理示例
export const tauriServiceName: ServiceName = {
  method1: async () => {
    try {
      return await invoke('cmd_method1');
    } catch (error) {
      throw new ServiceError({
        code: 'TAURI_ERROR',
        message: error.message,
        details: error
      });
    }
  },
};
```

## 📊 服务详情

### AuthService - 认证服务

**职责**: 用户认证、Token管理、会话控制

**接口**:
```typescript
interface AuthService {
  login(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
}
```

**实现**:
- **Tauri**: 调用后端认证API
- **Mock**: 模拟登录流程，支持配置

### ContactService - 联系人服务

**职责**: 联系人管理、群组管理、搜索功能

**接口**:
```typescript
interface ContactService {
  listAllContacts(): Promise<Contact[]>;
  listAll(): Promise<Contact[]>;
  listOwnedGroups(): Promise<Group[]>;
  listJoinedGroups(): Promise<Group[]>;
  search(query: string): Promise<Contact[]>;
  createGroup(groupData: any): Promise<Group>;
  joinGroup(groupId: string): Promise<void>;
  leaveGroup(groupId: string): Promise<void>;
}
```

**实现**:
- **Tauri**: 调用后端联系人API
- **Mock**: 使用LocalDbAdapter持久化存储

### MessageService - 消息服务

**职责**: 消息发送、接收、历史记录管理

**接口**:
```typescript
interface MessageService {
  sendMessage(conversationId: string, content: any, type?: string, replyTo?: number): Promise<void>;
  loadMessages(conversationId: string, messageId?: number, direction?: 'forward' | 'backward', limit?: number): Promise<Message[]>;
}
```

**实现**:
- **Tauri**: 调用后端消息API
- **Mock**: 使用LocalDbAdapter存储消息历史

### ConversationService - 会话服务

**职责**: 会话管理、会话列表、会话创建

**接口**:
```typescript
interface ConversationService {
  listAllConversations(): Promise<ConversationBase[]>;
  createConversation(targetUserId: string): Promise<ConversationBase>;
  getConversationById(id: string): Promise<ConversationBase>;
}
```

**实现**:
- **Tauri**: 调用后端会话API
- **Mock**: 内存存储会话数据

### FileService - 文件服务

**职责**: 文件上传、下载、管理

**接口**:
```typescript
interface FileService {
  uploadFile(conversationId: string, filePath: string): Promise<FileUploadCompleteResponse>;
  downloadFile(url: string, cachePath: string): Promise<string>;
  exists(filePath: string): Promise<boolean>;
}
```

**实现**:
- **Tauri**: 使用Tauri文件系统API
- **Mock**: 模拟文件操作

### EventService - 事件服务

**职责**: 实时事件处理、WebSocket管理

**接口**:
```typescript
interface EventService {
  subscribe<T>(event: string, callback: (data: T) => void): void;
  unsubscribe(event: string, callback?: (data: any) => void): void;
  emit<T>(event: string, data: T): void;
}
```

**实现**:
- **Tauri**: 使用Tauri事件系统
- **Mock**: 使用浏览器事件系统

### WindowService - 窗口服务

**职责**: 窗口管理、窗口状态控制

**接口**:
```typescript
interface WindowService {
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  close(): Promise<void>;
  setSize(width: number, height: number): Promise<void>;
  setPosition(x: number, y: number): Promise<void>;
}
```

**实现**:
- **Tauri**: 使用Tauri窗口API
- **Mock**: 模拟窗口操作

## 🔄 数据流

### 服务调用流程

```
1. Component/Store 调用服务
   ↓
2. 服务接口 (types.ts)
   ↓
3. 实现选择 (index.ts)
   ↓
4. Tauri实现 / Mock实现
   ↓
5. 返回结果 / 抛出错误
   ↓
6. Component/Store 处理结果
```

### 错误处理流程

```
1. 服务方法执行
   ↓
2. 捕获异常
   ↓
3. 转换为ServiceError
   ↓
4. 向上抛出
   ↓
5. Store处理错误
   ↓
6. UI显示错误信息
```

## 🛠️ 开发指南

### 创建新服务

1. **创建服务目录**:
```bash
mkdir src/services/newService
```

2. **定义接口** (`types.ts`):
```typescript
export interface NewService {
  method1(): Promise<ReturnType>;
  method2(param: ParamType): Promise<ReturnType>;
}
```

3. **实现Tauri版本** (`tauriImpl.ts`):
```typescript
import { invoke } from '@tauri-apps/api/core';
import type { NewService } from './types';

export const tauriNewService: NewService = {
  method1: async () => {
    return await invoke('cmd_method1');
  },
  method2: async (param) => {
    return await invoke('cmd_method2', { param });
  },
};
```

4. **实现Mock版本** (`mockImpl.ts`):
```typescript
import type { NewService } from './types';

export const mockNewService: NewService = {
  method1: async () => {
    return mockData;
  },
  method2: async (param) => {
    return mockData;
  },
};
```

5. **创建导出入口** (`index.ts`):
```typescript
import { tauriNewService } from './tauriImpl';
import { mockNewService } from './mockImpl';

const isTauriEnv = typeof window !== 'undefined' && window.__TAURI__;

export const newService = isTauriEnv ? tauriNewService : mockNewService;
```

### 测试服务

```typescript
// 测试Mock实现
import { mockNewService } from './mockImpl';

describe('NewService Mock', () => {
  it('should return mock data', async () => {
    const result = await mockNewService.method1();
    expect(result).toBeDefined();
  });
});
```

### 调试服务

```typescript
// 启用Mock模式
if (process.env.NODE_ENV === 'development') {
  // 强制使用Mock实现
  export const newService = mockNewService;
}
```

## 📈 性能优化

### 缓存策略
- 服务结果缓存
- 请求去重
- 懒加载

### 错误重试
- 网络错误自动重试
- 指数退避算法
- 最大重试次数限制

### 并发控制
- 请求队列管理
- 并发限制
- 优先级调度

## 🔮 扩展性

### 插件系统
- 服务中间件
- 自定义实现
- 动态加载

### 监控系统
- 性能监控
- 错误追踪
- 使用统计

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 