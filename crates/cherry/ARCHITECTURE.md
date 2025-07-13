# Cherry 项目架构文档

## 🤖 AI 快速理解指南

**项目背景**: Cherry是一个桌面聊天应用，采用Tauri+React+TypeScript技术栈，支持跨平台部署。

**核心设计决策**:
1. **服务层抽象**: 所有外部依赖通过服务层抽象，支持Mock/Tauri环境切换
2. **类型安全**: 完整的TypeScript类型定义，确保编译时类型检查
3. **状态管理**: 使用Zustand进行轻量级状态管理
4. **组件化**: 清晰的组件层次和职责分离

**AI开发要点**:
- 业务代码永远只导入服务层统一入口，不关心具体实现
- 所有类型定义在`@/types`中统一管理
- 组件遵循单一职责原则，UI和业务逻辑分离
- 错误处理统一使用ServiceError类型

**快速导航**:
- 需要了解整体架构 → 查看本文档
- 需要了解服务层设计 → 查看 `src/services/README.md`
- 需要了解类型系统 → 查看 `src/types/README.md`
- 需要了解开发规范 → 查看 `CODING_STANDARDS.md`
- 需要AI编程指南 → 查看 `AI_GUIDE.md`

## 📋 概述

Cherry 是一个基于 Tauri + React + TypeScript 的现代化桌面聊天应用，采用模块化、可扩展的架构设计，支持跨平台部署。

## 🏗️ 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Cherry 应用架构                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │    UI Layer     │  │  Business Layer │  │  Service Layer  │ │
│  │   (React)       │  │   (Store)       │  │   (Tauri/Mock)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Type System    │  │   Utilities     │  │   Hooks         │ │
│  │   (TypeScript)  │  │   (Utils)       │  │   (Custom)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Tauri Runtime Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   File System   │  │   Network       │  │   Database      │ │
│  │   (Native)      │  │   (HTTP/WS)     │  │   (SQLite)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 目录结构

```
src/
├── main.tsx                    # 应用入口
├── App.tsx                     # 根组件
├── App.styles.ts              # 根组件样式
├── App.stories.tsx            # Storybook 故事
├── index.css                  # 全局样式
├── vite-env.d.ts             # Vite 类型声明
│
├── types/                     # 类型定义系统
│   ├── README.md             # 类型系统文档
│   ├── index.ts              # 统一导出入口
│   ├── core.ts               # 核心基础类型
│   ├── api.ts                # API相关类型
│   ├── ui.ts                 # UI组件类型
│   ├── typeUtils.ts          # 类型工具函数
│   └── models/               # 数据模型类型
│       ├── index.ts
│       ├── user.ts           # 用户类型
│       ├── message.ts        # 消息类型
│       ├── conversation.ts   # 会话类型
│       ├── contact.ts        # 联系人类型
│       ├── settings.ts       # 设置类型
│       └── login.ts          # 登录类型
│
├── services/                  # 服务层
│   ├── authService/          # 认证服务
│   │   ├── types.ts
│   │   ├── tauriImpl.ts
│   │   ├── mockImpl.ts
│   │   └── index.ts
│   ├── contactService/       # 联系人服务
│   │   ├── types.ts
│   │   ├── tauriImpl.ts
│   │   ├── mockImpl.ts
│   │   ├── data/
│   │   │   └── db.ts
│   │   └── index.ts
│   ├── messageService/       # 消息服务
│   │   ├── types.ts
│   │   ├── tauriImpl.ts
│   │   ├── mockImpl.ts
│   │   ├── data/
│   │   │   ├── db.ts
│   │   │   └── setup-localstorage.ts
│   │   └── index.ts
│   ├── conversationService/  # 会话服务
│   │   ├── types.ts
│   │   ├── tauriImpl.ts
│   │   ├── mockImpl.ts
│   │   └── index.ts
│   ├── fileService/          # 文件服务
│   │   ├── types.ts
│   │   ├── tauriImpl.ts
│   │   ├── mockImpl.ts
│   │   └── index.ts
│   ├── eventService/         # 事件服务
│   │   ├── types.ts
│   │   ├── tauriImpl.ts
│   │   ├── mockImpl.ts
│   │   ├── README.md
│   │   ├── __tests__/
│   │   ├── examples/
│   │   └── index.ts
│   ├── windowService/        # 窗口服务
│   │   ├── types.ts
│   │   ├── tauriImpl.ts
│   │   ├── mockImpl.ts
│   │   └── index.ts
│   └── mock/                 # Mock 基础设施
│       └── LocalDbAdapter.ts
│
├── store/                    # 状态管理
│   ├── auth.ts              # 认证状态
│   ├── contact.ts           # 联系人状态
│   ├── conversation.ts      # 会话状态
│   ├── notification.ts      # 通知状态
│   └── readPosition.ts      # 阅读位置状态
│
├── components/               # UI 组件
│   ├── UI/                  # 基础 UI 组件
│   │   ├── index.ts
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── QuickEmojiReply.tsx
│   ├── ContactPage/         # 联系人页面组件
│   │   ├── index.tsx
│   │   ├── ContactGroup.tsx
│   │   ├── ContactItem.tsx
│   │   ├── ContactProfileModal.tsx
│   │   └── GroupSection.tsx
│   ├── settings/            # 设置页面组件
│   │   ├── SettingsPage.tsx
│   │   ├── GeneralSettings.tsx
│   │   ├── PrivacySettings.tsx
│   │   ├── NotificationSettings.tsx
│   │   └── AppearanceSettings.tsx
│   ├── login/               # 登录组件
│   ├── App.tsx              # 主应用组件
│   ├── Sidebar.tsx          # 侧边栏
│   ├── ChatHeader.tsx       # 聊天头部
│   ├── ConversationView.tsx # 会话视图
│   ├── MessageListSimple.tsx # 消息列表
│   ├── MessageInput.tsx     # 消息输入
│   ├── ContactList.tsx      # 联系人列表
│   ├── StatusBar.tsx        # 状态栏
│   ├── WindowControls.tsx   # 窗口控制
│   ├── NotificationManager.tsx # 通知管理
│   ├── NotificationToast.tsx # 通知提示
│   ├── EmojiPicker.tsx      # 表情选择器
│   ├── ImageUploader.tsx    # 图片上传
│   ├── ImageMessage.tsx     # 图片消息
│   ├── ReplyMessage.tsx     # 回复消息
│   ├── MessageDebug.tsx     # 消息调试
│   ├── DebugPanel.tsx       # 调试面板
│   └── ...                  # 其他组件
│
├── hooks/                   # 自定义 Hooks
│   ├── useMessageReceiver.ts # 消息接收 Hook
│   └── useWindowsSize.ts    # 窗口尺寸 Hook
│
├── utils/                   # 工具函数
├── assets/                  # 静态资源
├── svg/                     # SVG 图标
└── stories/                 # Storybook 故事
```

## 🔄 数据流架构

### 1. 单向数据流

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Service   │───▶│    Store    │───▶│  Component  │
│   Layer     │    │   (State)   │    │     UI      │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │
       │                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Backend   │    │   Actions   │    │   Events    │
│   (Tauri)   │    │  (Zustand)  │    │  (User)     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 2. 服务层架构

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

## 🎯 核心设计原则

### 1. 分层架构
- **UI Layer**: React 组件，负责界面渲染
- **Business Layer**: Zustand Store，负责业务逻辑
- **Service Layer**: 抽象服务，负责数据访问
- **Platform Layer**: Tauri/Mock，负责平台适配

### 2. 依赖倒置
- 高层模块不依赖低层模块
- 通过接口进行依赖
- 支持运行时切换实现

### 3. 单一职责
- 每个模块只负责一个功能域
- 服务层按业务功能划分
- 组件按UI功能划分

### 4. 开闭原则
- 对扩展开放，对修改封闭
- 通过接口和抽象支持扩展
- 保持向后兼容

## 🔧 技术栈

### 前端技术
- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **样式**: Styled Components
- **构建工具**: Vite
- **测试**: Storybook + Jest

### 桌面技术
- **框架**: Tauri
- **后端**: Rust
- **数据库**: SQLite
- **网络**: HTTP/WebSocket

### 开发工具
- **包管理**: npm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript
- **文档**: Markdown

## 📊 模块职责

### 服务层 (Services)

#### AuthService - 认证服务
- **职责**: 用户登录、注册、Token管理
- **接口**: `login()`, `logout()`, `validateToken()`
- **实现**: Tauri API / Mock

#### ContactService - 联系人服务
- **职责**: 联系人管理、群组管理
- **接口**: `listAllContacts()`, `search()`, `createGroup()`
- **实现**: Tauri API / Mock + LocalStorage

#### MessageService - 消息服务
- **职责**: 消息发送、接收、历史记录
- **接口**: `sendMessage()`, `loadMessages()`
- **实现**: Tauri API / Mock + LocalStorage

#### ConversationService - 会话服务
- **职责**: 会话管理、会话列表
- **接口**: `listAllConversations()`, `createConversation()`
- **实现**: Tauri API / Mock

#### FileService - 文件服务
- **职责**: 文件上传、下载、管理
- **接口**: `uploadFile()`, `downloadFile()`, `exists()`
- **实现**: Tauri File API / Mock

#### EventService - 事件服务
- **职责**: 实时事件处理、WebSocket管理
- **接口**: `subscribe()`, `unsubscribe()`, `emit()`
- **实现**: Tauri Event API / Mock

### 状态管理层 (Store)

#### AuthStore - 认证状态
- **状态**: 用户信息、登录状态、Token
- **方法**: `login()`, `logout()`, `refreshToken()`

#### ContactStore - 联系人状态
- **状态**: 联系人列表、群组列表、搜索状态
- **方法**: `refreshContacts()`, `searchContacts()`, `createGroup()`

#### ConversationStore - 会话状态
- **状态**: 会话列表、当前会话、消息列表
- **方法**: `refreshConversations()`, `selectConversation()`

#### NotificationStore - 通知状态
- **状态**: 通知列表、未读数量
- **方法**: `addNotification()`, `markAsRead()`

### UI组件层 (Components)

#### 基础组件 (UI/)
- **Avatar**: 用户头像
- **Button**: 按钮组件
- **LoadingSpinner**: 加载动画
- **ErrorMessage**: 错误提示

#### 页面组件
- **ContactPage**: 联系人页面
- **SettingsPage**: 设置页面
- **LoginPage**: 登录页面

#### 功能组件
- **MessageInput**: 消息输入
- **MessageList**: 消息列表
- **EmojiPicker**: 表情选择器
- **ImageUploader**: 图片上传

## 🔄 数据流示例

### 发送消息流程

```
1. User Input (MessageInput)
   ↓
2. MessageInput.onSend()
   ↓
3. messageService.sendMessage()
   ↓
4. tauriImpl.sendMessage() / mockImpl.sendMessage()
   ↓
5. Backend API / LocalStorage
   ↓
6. EventService.emit('message_sent')
   ↓
7. conversationStore.addMessage()
   ↓
8. MessageList re-render
```

### 接收消息流程

```
1. WebSocket Event / Mock Event
   ↓
2. EventService.handleMessage()
   ↓
3. conversationStore.addMessage()
   ↓
4. NotificationStore.addNotification()
   ↓
5. MessageList re-render
   ↓
6. NotificationToast.show()
```

## 🛡️ 错误处理

### 分层错误处理
1. **Service Layer**: 捕获API错误，转换为统一格式
2. **Store Layer**: 处理业务逻辑错误，更新错误状态
3. **UI Layer**: 显示错误信息，提供重试机制

### 错误类型
- **NetworkError**: 网络连接错误
- **AuthError**: 认证相关错误
- **ValidationError**: 数据验证错误
- **SystemError**: 系统级错误

## 🔧 配置管理

### 环境配置
- **开发环境**: Mock服务，本地存储
- **生产环境**: Tauri服务，SQLite数据库
- **测试环境**: Mock服务，内存存储

### 功能开关
- **调试模式**: 显示调试面板
- **Mock模式**: 使用Mock服务
- **离线模式**: 本地存储优先

## 📈 性能优化

### 代码分割
- 按路由分割组件
- 按功能分割服务
- 懒加载非关键组件

### 状态优化
- 局部状态管理
- 状态选择器优化
- 避免不必要的重渲染

### 缓存策略
- 消息历史缓存
- 联系人信息缓存
- 图片资源缓存

## 🔮 扩展性设计

### 插件系统
- 服务层插件接口
- UI组件插件接口
- 主题系统插件

### 国际化
- 多语言支持
- 动态语言切换
- 本地化资源管理

### 主题系统
- 动态主题切换
- 自定义主题支持
- 主题配置持久化

## 📚 开发指南

### 添加新功能
1. 定义类型 (`types/models/`)
2. 创建服务 (`services/`)
3. 更新状态 (`store/`)
4. 开发组件 (`components/`)
5. 编写测试 (`__tests__/`)

### 代码规范
- 遵循TypeScript严格模式
- 使用ESLint + Prettier
- 编写单元测试
- 更新文档

### 提交规范
- 使用语义化提交信息
- 包含测试用例
- 更新相关文档

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 