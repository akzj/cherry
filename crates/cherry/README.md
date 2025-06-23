# Cherry - Tauri + React + TypeScript IM Application

This project is built with Tauri, React, and TypeScript to create a modern instant messaging desktop application.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 前端架构设计 (Frontend Architecture Design)

好的，使用 Tauri + React 开发 IM 桌面应用，前端架构设计需要考虑以下几个关键方面：

🧱 **核心目标：**

*   **高效渲染：** 快速响应用户操作和实时数据更新。
*   **复杂状态管理：** 处理用户、会话、消息、联系人、群组、在线状态等复杂状态。
*   **实时通信：** 流畅地接收和展示实时消息、通知、状态变化。
*   **良好的用户体验：** 界面流畅、响应迅速、交互自然。
*   **可维护性与扩展性：** 代码结构清晰，易于理解和扩展功能。
*   **与 Tauri 后端集成：** 无缝调用 Tauri 提供的 Rust API。

## 📂 架构设计建议

### 1️⃣ 技术栈选择

*   **前端框架:** React (使用 Hooks，推荐使用 React 18+)
*   **状态管理:** 
    *   **主要状态管理:** Pinia (Vue 的状态管理库，但 React 社区也有类似方案如 `useReducer` + Redux Toolkit, Zustand)
    *   **微状态/副作用管理:** Zustand (轻量、简单、性能好，适合管理组件间共享的“微”状态或副作用逻辑)
    *   **可选:** Redux + Redux Toolkit (功能强大，但相对重，适合大型项目)
*   **UI 组件库:** Material-UI (MUI), Ant Design, 或自定义组件库 (推荐 MUI，文档完善，组件丰富)
*   **路由管理:** React Router DOM (标准选择)
*   **构建工具:** Vite (推荐，速度快，支持 JSX/TSX)
*   **类型定义:** TypeScript (强烈推荐，提高代码质量和可维护性)
*   **Tauri 前端部分:** 使用 `@tauri-apps/api` 进行调用

### 2️⃣ 核心架构模式

*   **组件化:** 将 UI 拆分为可复用、可测试的小部件。
    *   **原子组件:** 最小的 UI 单元（按钮、图标等）。
    *   **分子组件:** 组合原子组件形成特定功能的 UI（消息气泡、联系人条目等）。
    *   **组织组件:** 复杂的布局，组合分子/原子组件（聊天列表、会话窗口、设置面板等）。
*   **状态管理架构:**
    *   **全局状态 (Pinia/Zustand):** 存储需要跨组件共享、持久化的状态（用户信息、会话列表、当前选中会话、全局通知、在线状态、离线消息等）。
    *   **局部状态 (React Hooks):** 处理组件内部状态和逻辑（如单个聊天窗口的消息输入、滚动位置等）。
*   **数据流:**
    *   **自顶向下:** 全局状态变化通常由事件触发，通过 `commit`/`dispatch` 或直接 mutation 更新状态。
    *   **自底向上:** 组件触发事件（如点击发送消息），通知父组件或状态管理库进行状态更新。
    *   **与 Tauri 后端:** React 组件通过调用 Pinia Store 中的方法（或直接使用 `@tauri-apps/api`）来与 Tauri 后端进行通信（发起 WebSocket 连接、发送消息、接收消息回调等）。

### 3️⃣ 核心模块设计

#### ✅ A. 状态管理 (Pinia/Zustand)

*   **`store/index.ts`:** 定义主要的 Store 模块。
    *   **`user.ts`:** 用户信息、登录状态、权限。
    *   **`conversations.ts`:** 会话列表，包含会话的基本信息（对方用户/群组、最后一条消息、在线状态等）。
    *   **`messages.ts`:** 消息内容、消息状态（已发送、已送达、已读、撤回）、消息已读回执。
    *   **`contacts.ts`:** 联系人列表、好友申请、群组申请。
    *   **`settings.ts`:** 应用设置、界面主题、通知设置。
    *   **`notification.ts`:** 全局通知消息。
    *   **`onlineStatus.ts`:** 用户在线/离线状态。
    *   **`syncManager.ts`:** 管理离线消息同步逻辑。
*   **`store/utils.ts`:** 封装一些通用的 Pinia 功能（如持久化存储、加载）。
*   **`store/actions.ts`:** 可选，用于封装一些复杂的操作流程（如发送消息的完整流程）。

#### ✅ B. 实时通信与消息处理

*   **WebSocket 连接:**
    *   在 Tauri 的 Rust 后端建立 WebSocket 服务器或使用现成的库（如 `tokio-websocket`）。
    *   React 前端通过 [`@tauri-apps/api`](https://tauri.app/v1/api/js/) 调用 Rust 函数来建立和维护 WebSocket 连接。
    *   **建议:** 将 WebSocket 连接实例和主要的接收消息逻辑放在 [`messages`](#-a-状态管理-piniazustand) Store 或一个专门的 `WebSocketManager` 类中管理。
*   **消息处理:**
    *   **接收消息:** WebSocket 接收到消息后，通过 `@tauri-apps/api` 回调或事件总线通知 React 前端，更新 `messages` Store。
    *   **发送消息:** 用户点击发送，React 组件调用 `messages` Store 的方法（或直接 `@tauri-apps/api`）发送消息到 Tauri 后端，Tauri 后端通过 WebSocket 推送出去。
    *   **消息状态更新:** 实时更新消息的“已发送、已送达、已读”状态，这些状态通常由服务器推送或通过长轮询/短轮询补充。
*   **集成:** 使用 [`@tauri-apps/api`](https://tauri.app/v1/api/js/) 提供的 [`invoke`](https://tauri.app/v1/api/js/invoke) 方法和 [`listen`](https://tauri.app/v1/api/js/event#listen) 方法来与 Rust 后端进行双向通信。

#### ✅ C. UI 组件

*   **`components/atoms`:** 基础 UI 原语。
*   **`components/molecules`:** 组合原子组件形成特定功能。
    *   `MessageBubble.tsx`: 根据消息类型（文本、图片、语音等）和发送者渲染消息气泡。
    *   `ConversationListItem.tsx`: 会话列表中的单条会话项。
    *   `ContactListItem.tsx`: 联系人列表中的单条联系人项。
    *   `InputArea.tsx`: 消息输入框和发送按钮。
    *   `OnlineIndicator.tsx`: 显示用户在线状态的小组件。
*   **`components/organisms`:** 复合组件。
    *   `ChatWindow.tsx`: 整个聊天窗口，包含会话头部、消息列表、输入区域。
    *   `ContactsList.tsx`: 联系人列表页面。
    *   `ConversationsList.tsx`: 会话列表页面。
    *   `SettingsPage.tsx`: 设置页面。
*   **`components/templates`:** 页面布局模板。
    *   `Layout.tsx`: 整体应用布局（侧边栏 + 主内容区）。

#### ✅ D. 路由

*   **`src/routes`:**
    *   `Conversation.tsx`: 会话页面。
    *   `Contacts.tsx`: 联系人页面。
    *   `Conversations.tsx`: 会话列表页面。
    *   `Settings.tsx`: 设置页面。
    *   `NotFound.tsx`: 404 页面。
*   使用 `React Router DOM` 进行路由配置。

#### ✅ E. 与 Tauri 的集成

*   **`src/tauri`:**
    *   `invoke.ts`: 封装 `@tauri-apps/api` 的 `invoke` 方法，提供类型安全的调用方式。
    *   `listen.ts`: 封装事件监听。
    *   `commands.ts`: 定义 Tauri 前端需要调用的 Rust 命令接口。
*   **集成方式:**
    1.  React 组件需要执行操作（如发送消息）时，调用 Pinia Store 中的方法。
    2.  Pinia Store 的方法内部，通过 `invoke` 调用 Tauri 命令。
    3.  Tauri Rust 后端处理命令，执行业务逻辑（如通过 WebSocket 发送消息）。
    4.  Tauri Rust 后端通过事件系统（如 `tokio::sync::mpsc` 或 Tauri 的 `Event` 机制）通知前端 WebSocket 消息已发送。
    5.  前端通过 `listen` 接收 Tauri 发来的事件，更新状态。

#### ✅ F. 数据处理与同步

*   **消息存储:** Tauri 后端（Rust + SQLite 或其他数据库）负责存储消息、用户、会话等数据。
*   **前端缓存:** 使用 `localStorage` 或 IndexedDB 缓存部分数据（如离线消息、会话列表），在应用启动时加载，提升离线体验。
*   **同步逻辑:** 在 `syncManager` Store 中实现，负责将本地缓存的数据同步到 Tauri 后端，或将后端的数据同步到本地缓存。

### 4️⃣ 非功能性考虑

*   **性能优化:**
    *   使用 `React.memo`, `useMemo`, `useCallback` 进行组件和计算的优化。
    *   长消息列表使用 `react-window` 或 `@tanstack/react-virtualized` 实现虚拟滚动。
    *   懒加载组件 (`React.lazy` + `Suspense`)。
*   **错误处理:** 对 WebSocket 连接、API 调用、状态更新等进行健壮的错误处理和用户提示。
*   **测试:**
    *   单元测试：使用 Jest + React Testing Library 测试组件和 Hook。
    *   存储测试：使用 Vitest + Testing Library + `@testing-library/user-event`。
    *   集成测试：模拟 Tauri API 调用，测试状态管理和 UI 行为。
*   **可访问性 (a11y):** 确保 UI 符合 WCAG 标准。
*   **国际化:** 使用 `i18next` 等库实现多语言支持。
*   **日志:** 使用 `console` 或 `logseq` (前端日志库) 进行调试，生产环境可集成更强大的日志方案。

### 5️⃣ 总结

一个典型的 Tauri + React IM 应用前端架构设计包含以下层次：

```plaintext
src/
├── /components         # UI 组件 (原子、分子、组织、模板)
├── /hooks              # 自定义 React Hooks
├── /layouts            # 页面布局模板
├── /pages              # 页面组件 (对应路由)
├── /routes             # 路由配置
├── /services           # 与 Tauri 后端通信的服务封装 (invoke, listen)
├── /stores             # Pinia/Zustand 状态管理 Store
├── /utils              # 工具函数、类型定义等
├── /assets             # 静态资源
├── index.tsx           # 入口文件
├── router.tsx          # 路由配置文件
└── stores/index.ts     # 状态管理入口
```

## 📌 关键点强调

*   **Tauri 是桥梁:** React 前端和 Rust 后端通过 Tauri 的 `invoke` 和 `listen` 机制进行交互，Rust 处理核心逻辑和 I/O。
*   **状态管理是核心:** IM 应用状态复杂，需要选择合适的状态管理方案来组织和维护这些状态。
*   **实时性是关键:** WebSocket 是 IM 应用的标配，需要妥善管理连接和消息流。
*   **组件化提升可维护性:** 将 UI 拆分成小而专注的组件是良好架构的基础。
*   **性能不可忽视:** 尤其是消息列表这种大数据量场景，虚拟滚动是必须考虑的。

## 📚 最佳实践建议

1.  **先搭建基础框架:** 使用 Vite + React + TypeScript + Tailwind CSS (或 MUI) 搭建基础项目。
2.  **设计状态模型:** 在开始详细编码前，先设计好需要存储的核心状态及其结构。
3.  **实现 Tauri 集成:** 在完成基本 UI 后，快速集成 Tauri，实现基本的前后端通信。
4.  **逐步实现功能:** 先实现核心功能（登录、会话列表、消息收发），再逐步添加其他功能。
5.  **注重状态同步:** 确保前端状态与 Tauri 后端状态的同步逻辑清晰可靠。
6.  **代码规范:** 强制执行 ESLint + Prettier 规范。

这个架构设计是一个起点，具体实现细节会根据项目规模、团队偏好和实际需求而变化。祝你开发顺利！🚀 