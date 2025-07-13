# 类型定义系统

## 概述

本项目的类型定义系统采用模块化设计，按功能域组织类型定义，确保类型安全、可维护性和可扩展性。

## 目录结构

```
src/types/
├── README.md              # 本文档
├── index.ts              # 统一导出入口
├── core.ts               # 核心基础类型
├── api.ts                # API相关类型
├── models/               # 数据模型类型
│   ├── index.ts
│   ├── user.ts          # 用户相关类型
│   ├── message.ts       # 消息相关类型
│   ├── conversation.ts  # 会话相关类型
│   ├── contact.ts       # 联系人相关类型
│   └── settings.ts      # 设置相关类型
├── ui.ts                # UI组件类型
└── utils.ts             # 类型工具函数
```

## 设计原则

### 1. 模块化组织
- 按功能域组织类型定义
- 每个模块有明确的职责边界
- 避免循环依赖

### 2. 统一导出
- 所有类型通过 `src/types/index.ts` 统一导出
- 使用 `@/types` 路径别名导入
- 避免直接导入具体文件

### 3. 类型安全
- 使用严格的类型定义
- 避免使用 `any` 类型
- 提供完整的类型覆盖

### 4. 向后兼容
- 保持API类型稳定性
- 使用可选属性处理版本差异
- 提供类型迁移指南

## 使用规范

### 导入方式
```typescript
// ✅ 推荐：从统一入口导入
import { User, Message, Contact } from '@/types';

// ❌ 避免：直接导入具体文件
import { User } from '@/types/user';
```

### 类型定义规范
```typescript
// ✅ 推荐：使用接口定义对象类型
export interface User {
  id: string;
  name: string;
  email?: string;
}

// ✅ 推荐：使用类型别名定义联合类型
export type UserStatus = 'online' | 'offline' | 'busy' | 'away';

// ✅ 推荐：使用泛型提高复用性
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

### 命名规范
- 接口名使用 PascalCase
- 类型别名使用 PascalCase
- 枚举值使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

## 模块说明

### core.ts - 核心基础类型
- 基础数据类型定义
- 通用工具类型
- 系统级类型

### api.ts - API相关类型
- 请求/响应类型
- API错误类型
- 认证相关类型

### models/ - 数据模型类型
- 业务实体类型
- 数据库模型类型
- 数据传输对象

### ui.ts - UI组件类型
- 组件Props类型
- 样式相关类型
- 事件处理类型

### utils.ts - 类型工具函数
- 类型转换函数
- 类型验证函数
- 类型工具函数

## 迁移指南

### 从旧版本迁移
1. 更新导入路径为 `@/types`
2. 检查类型兼容性
3. 更新类型定义

### 添加新类型
1. 确定类型所属模块
2. 在对应文件中定义类型
3. 在 `index.ts` 中导出
4. 更新本文档

## 常见问题

### Q: 如何处理可选属性？
A: 使用 `?` 标记可选属性，并提供默认值或类型守卫。

### Q: 如何处理联合类型？
A: 使用类型别名定义联合类型，并提供类型守卫函数。

### Q: 如何处理泛型类型？
A: 使用泛型约束，提供默认类型参数。

## 维护指南

### 定期检查
- 检查类型使用情况
- 清理未使用的类型
- 更新类型文档

### 版本管理
- 记录类型变更
- 提供迁移指南
- 保持向后兼容 