# Cherry 项目 AI 快速理解指南

## 🚀 5分钟快速上手

### 1. 项目概览 (30秒)
- **项目类型**: 桌面聊天应用
- **技术栈**: Tauri + React + TypeScript + Zustand
- **架构模式**: 分层架构 + 服务抽象 + 类型安全
- **开发模式**: 面向AI编程，文档驱动开发

### 2. 核心设计理念 (1分钟)
```
UI Layer (React) → Business Layer (Zustand) → Service Layer (Tauri/Mock)
```

**关键理解**:
- 服务层抽象所有外部依赖，支持Mock/Tauri切换
- 业务代码永远只导入服务层统一入口
- 完整的TypeScript类型定义确保类型安全
- 组件遵循单一职责原则

### 3. 目录结构理解 (1分钟)
```
src/
├── types/           # 统一类型定义 (@/types)
├── services/        # 服务层 (每个服务: types.ts + tauriImpl.ts + mockImpl.ts + index.ts)
├── store/          # 状态管理 (Zustand)
├── components/     # UI组件 (UI/ + Feature/ + Page/)
└── hooks/          # 自定义Hooks
```

### 4. 开发规范要点 (1分钟)
- **文件命名**: 组件PascalCase，服务camelCase，类型PascalCase
- **导入路径**: 使用 `@/` 别名，避免相对路径
- **错误处理**: 统一使用 `ServiceError` 类型
- **代码风格**: 遵循ESLint + Prettier规范

### 5. 快速开始开发 (1分钟)

#### 创建新服务
```typescript
// 1. 定义接口 (types.ts)
interface NewService {
  method(): Promise<ReturnType>;
}

// 2. Tauri实现 (tauriImpl.ts)
export const tauriNewService: NewService = {
  method: async () => await invoke('cmd_method')
};

// 3. Mock实现 (mockImpl.ts)
export const mockNewService: NewService = {
  method: async () => mockData
};

// 4. 导出入口 (index.ts)
export const newService = isTauriEnv ? tauriNewService : mockNewService;
```

#### 创建新组件
```typescript
// ComponentName.tsx
import React from 'react';
import styled from 'styled-components';
import type { ComponentProps } from './types';

const ComponentName: React.FC<ComponentProps> = ({ prop1, children }) => {
  return <Container>{children}</Container>;
};

export default ComponentName;
```

#### 创建新Store
```typescript
// store/newStore.ts
import { create } from 'zustand';
import { newService } from '@/services/newService';

export const useNewStore = create<NewStoreState>((set) => ({
  data: [],
  loading: false,
  actions: {
    fetchData: async () => {
      set({ loading: true });
      const data = await newService.getData();
      set({ data, loading: false });
    }
  }
}));
```

## 📚 深入学习路径

### 第一阶段：基础理解
1. [AI_GUIDE.md](./AI_GUIDE.md) - AI编程完整指南
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构设计详解
3. [CODING_STANDARDS.md](./CODING_STANDARDS.md) - 开发规范

### 第二阶段：模块深入
1. [src/services/README.md](./src/services/README.md) - 服务层设计
2. [src/types/README.md](./src/types/README.md) - 类型系统
3. [src/components/README.md](./src/components/README.md) - 组件系统

### 第三阶段：实践应用
1. [templates/README.md](./templates/README.md) - 代码模板
2. [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发流程
3. 查看现有代码实现

## 🎯 AI编程最佳实践

### 1. 理解需求
- 仔细阅读需求描述
- 理解业务逻辑和用户场景
- 确定技术实现方案

### 2. 遵循架构
- 按照分层架构设计
- 使用服务层抽象外部依赖
- 保持类型安全和代码规范

### 3. 编写文档
- 为新增功能编写文档
- 更新相关README
- 添加使用示例和测试

### 4. 考虑测试
- 编写单元测试
- 提供Mock实现
- 确保测试覆盖率

## 🔍 常见问题

### Q: 如何创建新服务？
A: 参考 `templates/service/` 目录下的模板，按照 `types.ts` → `tauriImpl.ts` → `mockImpl.ts` → `index.ts` 的顺序创建。

### Q: 如何创建新组件？
A: 参考 `templates/component/` 目录下的模板，确定组件类型（UI/Feature/Page），创建组件文件和类型定义。

### Q: 如何处理错误？
A: 统一使用 `ServiceError` 类型，在服务层抛出，在业务层捕获处理。

### Q: 如何切换Mock/Tauri环境？
A: 通过 `isTauriEnv` 自动检测，业务代码无需关心，直接使用服务统一入口。

## 📞 获取帮助

- 查看相关文档
- 参考现有代码实现
- 使用代码模板
- 遵循开发规范

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 