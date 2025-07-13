# Cherry 项目 AI 编程指南

## 🤖 面向AI编程的文档设计

本文档专为AI助手设计，帮助AI快速理解Cherry项目的架构、设计模式和开发规范，以便更好地参与项目开发。

## 📋 项目概览

### 项目类型
- **应用类型**: 桌面聊天应用
- **技术栈**: Tauri + React + TypeScript + Zustand
- **架构模式**: 分层架构 + 依赖倒置 + 服务抽象
- **开发模式**: 面向AI编程，文档驱动开发

### 核心设计理念
1. **服务层抽象**: 所有外部依赖通过服务层抽象，支持Mock/Tauri切换
2. **类型安全**: 完整的TypeScript类型定义，确保编译时类型检查
3. **模块化**: 清晰的模块边界和职责分离
4. **可测试性**: 每个模块都支持独立测试和Mock

## 🏗️ 架构理解要点

### 1. 分层架构
```
UI Layer (React Components)
    ↓
Business Layer (Zustand Stores)
    ↓
Service Layer (Tauri/Mock Services)
    ↓
Platform Layer (Tauri Runtime)
```

**关键理解**: 
- UI层只关心展示和用户交互
- 业务层管理应用状态和业务逻辑
- 服务层抽象外部依赖，支持环境切换
- 平台层提供原生能力

### 2. 服务层设计模式
每个服务都遵循以下模式：
```typescript
// 1. 接口定义 (types.ts)
interface ServiceName {
  method(): Promise<ReturnType>;
}

// 2. Tauri实现 (tauriImpl.ts)
export const tauriServiceName: ServiceName = {
  method: async () => await invoke('cmd_method')
};

// 3. Mock实现 (mockImpl.ts)
export const mockServiceName: ServiceName = {
  method: async () => mockData
};

// 4. 自动切换 (index.ts)
export const serviceName = isTauriEnv ? tauriServiceName : mockServiceName;
```

**AI理解要点**:
- 业务代码永远只导入 `serviceName`，不关心具体实现
- 环境检测在index.ts中统一处理
- Mock实现使用LocalDbAdapter持久化数据

### 3. 状态管理模式
使用Zustand进行状态管理：
```typescript
// 状态定义
interface StoreState {
  data: DataType[];
  loading: boolean;
  error: string | null;
  actions: {
    fetchData: () => Promise<void>;
    updateData: (data: DataType) => void;
  };
}

// 状态实现
const useStore = create<StoreState>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  actions: {
    fetchData: async () => {
      set({ loading: true });
      try {
        const data = await service.getData();
        set({ data, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    }
  }
}));
```

## 🔧 开发规范理解

### 1. 文件命名规范
- **组件**: PascalCase (UserProfile.tsx)
- **服务**: camelCase (userService)
- **类型**: PascalCase (User, Message)
- **工具函数**: camelCase (formatDate, validateEmail)

### 2. 导入路径规范
```typescript
// ✅ 推荐：使用别名导入
import { User } from '@/types';
import { userService } from '@/services/userService';
import { useUserStore } from '@/store/user';

// ❌ 避免：相对路径导入
import { User } from '../../types';
```

### 3. 类型定义规范
```typescript
// ✅ 推荐：接口定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ 推荐：类型别名定义联合类型
type Status = 'loading' | 'success' | 'error';

// ✅ 推荐：泛型定义通用类型
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

### 4. 错误处理规范
```typescript
// 统一错误类型
export class ServiceError extends Error {
  code: string;
  constructor(message: string, code = 'SERVICE_ERROR') {
    super(message);
    this.code = code;
  }
}

// 错误处理示例
try {
  const result = await service.method();
  return result;
} catch (error) {
  if (error instanceof ServiceError) {
    // 处理业务错误
    throw error;
  } else {
    // 处理系统错误
    throw new ServiceError('Unknown error', 'SYSTEM_ERROR');
  }
}
```

## 📝 代码生成指南

### 1. 生成新服务
当需要创建新服务时，AI应该：

1. **创建服务目录结构**:
```
newService/
├── types.ts         # 接口定义
├── tauriImpl.ts     # Tauri实现
├── mockImpl.ts      # Mock实现
├── index.ts         # 导出入口
└── README.md        # 服务文档
```

2. **定义服务接口**:
```typescript
// types.ts
export interface NewService {
  method1(param: ParamType): Promise<ReturnType>;
  method2(): Promise<ReturnType2>;
}

export class ServiceError extends Error {
  code: string;
  constructor(message: string, code = 'SERVICE_ERROR') {
    super(message);
    this.code = code;
  }
}
```

3. **实现Tauri版本**:
```typescript
// tauriImpl.ts
import { invoke } from '@tauri-apps/api/core';
import type { NewService } from './types';

export const tauriNewService: NewService = {
  method1: async (param) => {
    return await invoke<ReturnType>('cmd_method1', { param });
  },
  method2: async () => {
    return await invoke<ReturnType2>('cmd_method2');
  }
};
```

4. **实现Mock版本**:
```typescript
// mockImpl.ts
import type { NewService } from './types';

export const mockNewService: NewService = {
  method1: async (param) => {
    // 返回Mock数据
    return mockData;
  },
  method2: async () => {
    return mockData2;
  }
};
```

5. **创建导出入口**:
```typescript
// index.ts
import { isTauriEnv } from '@/utils';
import { tauriNewService } from './tauriImpl';
import { mockNewService } from './mockImpl';

export * from './types';
export const newService = isTauriEnv ? tauriNewService : mockNewService;
```

### 2. 生成新组件
当需要创建新组件时，AI应该：

1. **确定组件类型**:
- UI组件: 放在 `components/UI/`
- 功能组件: 放在 `components/Feature/`
- 页面组件: 放在 `components/Page/`

2. **创建组件结构**:
```typescript
// ComponentName.tsx
import React from 'react';
import styled from 'styled-components';
import type { ComponentProps } from './types';

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2, children }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

const Container = styled.div`
  // 样式定义
`;

export default ComponentName;
```

3. **定义组件类型**:
```typescript
// types.ts
export interface ComponentProps {
  prop1: string;
  prop2?: number;
  children?: React.ReactNode;
  onClick?: () => void;
}
```

### 3. 生成新Store
当需要创建新Store时，AI应该：

```typescript
// store/newStore.ts
import { create } from 'zustand';
import type { NewDataType } from '@/types';
import { newService } from '@/services/newService';

interface NewStoreState {
  data: NewDataType[];
  loading: boolean;
  error: string | null;
  actions: {
    fetchData: () => Promise<void>;
    updateData: (data: NewDataType) => void;
    clearError: () => void;
  };
}

export const useNewStore = create<NewStoreState>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  actions: {
    fetchData: async () => {
      set({ loading: true, error: null });
      try {
        const data = await newService.getData();
        set({ data, loading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          loading: false 
        });
      }
    },
    updateData: (data) => {
      set((state) => ({ 
        data: [...state.data, data] 
      }));
    },
    clearError: () => {
      set({ error: null });
    }
  }
}));
```

## 🧪 测试理解

### 1. 测试策略
- **单元测试**: 测试单个函数或组件
- **集成测试**: 测试服务层和业务逻辑
- **E2E测试**: 测试完整用户流程

### 2. Mock测试
```typescript
// 测试服务
import { mockService } from '@/services/service/mockImpl';

describe('Service', () => {
  it('should handle success case', async () => {
    const result = await mockService.method();
    expect(result).toBeDefined();
  });
});
```

### 3. 组件测试
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

## 🔍 常见问题解决

### 1. 类型错误
- 检查类型定义是否完整
- 确保导入路径正确
- 验证泛型参数

### 2. 服务调用错误
- 确认服务接口定义正确
- 检查Tauri命令是否存在
- 验证Mock实现是否完整

### 3. 状态管理问题
- 确认Store结构正确
- 检查状态更新逻辑
- 验证异步操作处理

## 📚 学习资源

### 1. 核心文档
- [架构文档](./ARCHITECTURE.md) - 整体架构设计
- [开发规范](./CODING_STANDARDS.md) - 代码规范
- [服务层文档](./src/services/README.md) - 服务层设计

### 2. 类型系统
- [类型系统文档](./src/types/README.md) - 类型定义规范
- [核心类型](./src/types/core.ts) - 基础类型定义

### 3. 组件系统
- [组件文档](./src/components/README.md) - 组件设计规范
- [UI组件](./src/components/UI/) - 基础UI组件

## 🎯 AI编程最佳实践

### 1. 理解需求
- 仔细阅读需求描述
- 理解业务逻辑
- 确定技术实现方案

### 2. 遵循架构
- 按照分层架构设计
- 使用服务层抽象
- 保持类型安全

### 3. 编写文档
- 为新增功能编写文档
- 更新相关README
- 添加使用示例

### 4. 考虑测试
- 编写单元测试
- 提供Mock实现
- 确保测试覆盖

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 