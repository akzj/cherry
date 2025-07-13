# 代码模板目录

本目录包含AI编程时使用的标准化代码模板，确保生成的代码符合项目规范。

## 📁 模板结构

```
templates/
├── README.md              # 本文档
├── service/               # 服务模板
│   ├── types.ts.template
│   ├── tauriImpl.ts.template
│   ├── mockImpl.ts.template
│   ├── index.ts.template
│   └── README.md.template
├── component/             # 组件模板
│   ├── Component.tsx.template
│   ├── types.ts.template
│   └── index.ts.template
├── store/                 # Store模板
│   └── store.ts.template
└── hook/                  # Hook模板
    └── hook.ts.template
```

## 🎯 使用说明

AI在生成代码时，应该：

1. **选择合适的模板**: 根据需求选择对应的模板类型
2. **替换占位符**: 将模板中的占位符替换为实际内容
3. **遵循规范**: 确保生成的代码符合项目开发规范
4. **添加文档**: 为生成的代码添加相应的文档说明

## 📝 模板说明

### 服务模板
- **用途**: 创建新的服务层模块
- **包含**: 接口定义、Tauri实现、Mock实现、导出入口、文档
- **特点**: 自动环境切换、统一错误处理、类型安全

### 组件模板
- **用途**: 创建新的React组件
- **包含**: 组件实现、类型定义、样式定义
- **特点**: 单一职责、类型安全、可复用

### Store模板
- **用途**: 创建新的状态管理模块
- **包含**: 状态定义、异步操作、错误处理
- **特点**: Zustand模式、类型安全、可测试

### Hook模板
- **用途**: 创建新的自定义Hook
- **包含**: Hook实现、类型定义、使用示例
- **特点**: 逻辑复用、类型安全、可测试

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 