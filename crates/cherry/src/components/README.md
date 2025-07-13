# 组件层架构文档

## 📋 概述

组件层是Cherry应用的UI展示层，采用React函数式组件和TypeScript，结合Styled Components实现样式管理。组件按功能域组织，支持可复用性和可维护性。

## 🏗️ 架构设计

### 组件层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Page          │  │   Feature       │  │   UI            │ │
│  │  Components     │  │  Components     │  │  Components     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Layout        │  │   Business      │  │   Utility       │ │
│  │  Components     │  │  Components     │  │  Components     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 设计原则

1. **组件化**: 每个组件职责单一，可独立开发和测试
2. **可复用性**: 基础组件可在多个地方复用
3. **类型安全**: 完整的TypeScript类型定义
4. **样式隔离**: 使用Styled Components避免样式冲突
5. **性能优化**: 合理的组件拆分和状态管理

## 📁 目录结构

```
components/
├── README.md                 # 本文档
├── UI/                      # 基础UI组件
│   ├── index.ts            # 统一导出
│   ├── Avatar.tsx          # 头像组件
│   ├── Button.tsx          # 按钮组件
│   ├── EmptyState.tsx      # 空状态组件
│   ├── ErrorMessage.tsx    # 错误信息组件
│   ├── LoadingSpinner.tsx  # 加载动画组件
│   └── QuickEmojiReply.tsx # 快速表情回复组件
├── ContactPage/            # 联系人页面组件
│   ├── index.tsx          # 页面入口
│   ├── ContactGroup.tsx   # 联系人分组
│   ├── ContactItem.tsx    # 联系人项
│   ├── ContactProfileModal.tsx # 联系人资料模态框
│   └── GroupSection.tsx   # 群组区域
├── settings/              # 设置页面组件
│   ├── SettingsPage.tsx   # 设置页面
│   ├── GeneralSettings.tsx # 通用设置
│   ├── PrivacySettings.tsx # 隐私设置
│   ├── NotificationSettings.tsx # 通知设置
│   └── AppearanceSettings.tsx # 外观设置
├── login/                 # 登录组件
├── App.tsx               # 主应用组件
├── Sidebar.tsx           # 侧边栏
├── ChatHeader.tsx        # 聊天头部
├── ConversationView.tsx  # 会话视图
├── MessageListSimple.tsx # 消息列表
├── MessageInput.tsx      # 消息输入
├── ContactList.tsx       # 联系人列表
├── StatusBar.tsx         # 状态栏
├── WindowControls.tsx    # 窗口控制
├── NotificationManager.tsx # 通知管理
├── NotificationToast.tsx # 通知提示
├── EmojiPicker.tsx       # 表情选择器
├── ImageUploader.tsx     # 图片上传
├── ImageMessage.tsx      # 图片消息
├── ReplyMessage.tsx      # 回复消息
├── MessageDebug.tsx      # 消息调试
├── DebugPanel.tsx        # 调试面板
└── ...                   # 其他组件
```

## 🔧 组件规范

### 组件结构模板

```typescript
// 导入依赖
import React from 'react';
import styled from 'styled-components';
import { ComponentProps } from '@/types';

// 样式定义
const Container = styled.div`
  // 样式定义
`;

const Title = styled.h1`
  // 样式定义
`;

// 组件接口
interface ComponentNameProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

// 组件实现
const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onAction,
  children
}) => {
  // 状态管理
  const [state, setState] = React.useState();

  // 事件处理
  const handleClick = () => {
    onAction?.();
  };

  // 渲染
  return (
    <Container>
      <Title>{title}</Title>
      {children}
    </Container>
  );
};

// 默认导出
export default ComponentName;
```

### Props规范

```typescript
// 基础Props接口
interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// 扩展Props接口
interface ExtendedComponentProps extends BaseComponentProps {
  // 特定属性
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

// 事件处理Props
interface EventComponentProps {
  onClick?: () => void;
  onChange?: (value: string) => void;
  onSubmit?: (data: FormData) => void;
}
```

### 样式规范

```typescript
// 使用Styled Components
const StyledComponent = styled.div<{ $variant: string }>`
  // 基础样式
  display: flex;
  align-items: center;
  justify-content: center;
  
  // 条件样式
  background-color: ${props => 
    props.$variant === 'primary' ? '#007bff' : '#6c757d'
  };
  
  // 响应式样式
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  // 主题样式
  ${props => props.theme.colors.primary};
`;

// 使用CSS变量
const ThemedComponent = styled.div`
  color: var(--text-color);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
`;
```

## 📊 组件分类

### 基础UI组件 (UI/)

#### Avatar - 头像组件
**职责**: 显示用户头像，支持不同尺寸和状态

**Props**:
```typescript
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number | 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
}
```

**使用示例**:
```typescript
<Avatar 
  src="user-avatar.jpg" 
  alt="User Name" 
  size="medium" 
  status="online" 
/>
```

#### Button - 按钮组件
**职责**: 通用按钮组件，支持多种样式和状态

**Props**:
```typescript
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  htmlType?: 'button' | 'submit' | 'reset';
}
```

**使用示例**:
```typescript
<Button 
  type="primary" 
  size="medium" 
  onClick={handleClick}
  loading={isLoading}
>
  Click Me
</Button>
```

#### LoadingSpinner - 加载动画
**职责**: 显示加载状态

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}
```

### 页面组件

#### ContactPage - 联系人页面
**职责**: 联系人管理页面，包含联系人列表、搜索、分组等功能

**组件结构**:
```
ContactPage/
├── index.tsx              # 页面入口
├── ContactGroup.tsx       # 联系人分组
├── ContactItem.tsx        # 联系人项
├── ContactProfileModal.tsx # 联系人资料模态框
└── GroupSection.tsx       # 群组区域
```

**功能特性**:
- 联系人列表展示
- 按字母分组
- 搜索功能
- 群组管理
- 联系人详情

#### SettingsPage - 设置页面
**职责**: 应用设置页面，包含各种配置选项

**组件结构**:
```
settings/
├── SettingsPage.tsx       # 设置页面主组件
├── GeneralSettings.tsx    # 通用设置
├── PrivacySettings.tsx    # 隐私设置
├── NotificationSettings.tsx # 通知设置
└── AppearanceSettings.tsx # 外观设置
```

**功能特性**:
- 设置分类导航
- 表单验证
- 实时保存
- 主题切换

### 功能组件

#### MessageInput - 消息输入
**职责**: 消息输入组件，支持文本、图片、表情等多种输入方式

**Props**:
```typescript
interface MessageInputProps {
  conversationId: string;
  onSend?: (message: Message) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

**功能特性**:
- 文本输入
- 图片上传
- 表情选择
- 回复消息
- 快捷键支持

#### MessageList - 消息列表
**职责**: 消息列表展示，支持滚动加载、消息状态等

**Props**:
```typescript
interface MessageListProps {
  messages: Message[];
  conversationId: string;
  onLoadMore?: () => void;
  onMessageClick?: (message: Message) => void;
}
```

**功能特性**:
- 消息渲染
- 滚动加载
- 消息状态
- 时间分组
- 消息操作

#### EmojiPicker - 表情选择器
**职责**: 表情选择组件，支持表情分类和搜索

**Props**:
```typescript
interface EmojiPickerProps {
  onSelect?: (emoji: string) => void;
  visible?: boolean;
  onClose?: () => void;
}
```

## 🔄 组件通信

### Props传递
```typescript
// 父组件
const ParentComponent = () => {
  const handleAction = (data: any) => {
    // 处理子组件事件
  };

  return (
    <ChildComponent 
      data={someData} 
      onAction={handleAction} 
    />
  );
};

// 子组件
const ChildComponent: React.FC<ChildComponentProps> = ({
  data,
  onAction
}) => {
  const handleClick = () => {
    onAction?.(data);
  };

  return <button onClick={handleClick}>Click</button>;
};
```

### Context使用
```typescript
// 创建Context
const ThemeContext = React.createContext<ThemeContextType>({});

// Provider组件
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用Context
const ThemedComponent = () => {
  const { theme, setTheme } = React.useContext(ThemeContext);
  
  return (
    <div className={theme}>
      <button onClick={() => setTheme('dark')}>
        Switch Theme
      </button>
    </div>
  );
};
```

## 🛠️ 开发指南

### 创建新组件

1. **创建组件文件**:
```bash
touch src/components/NewComponent.tsx
```

2. **定义组件接口**:
```typescript
interface NewComponentProps {
  title: string;
  onAction?: () => void;
}
```

3. **实现组件**:
```typescript
const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

4. **添加样式**:
```typescript
const Container = styled.div`
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;
```

5. **导出组件**:
```typescript
export default NewComponent;
```

### 组件测试

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import NewComponent from './NewComponent';

describe('NewComponent', () => {
  it('should render title', () => {
    render(<NewComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should call onAction when button clicked', () => {
    const mockAction = jest.fn();
    render(<NewComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

### 组件文档

```typescript
/**
 * NewComponent - 新组件
 * 
 * 用于显示和处理特定功能的组件
 * 
 * @example
 * ```tsx
 * <NewComponent 
 *   title="Hello World" 
 *   onAction={() => console.log('clicked')} 
 * />
 * ```
 */
const NewComponent: React.FC<NewComponentProps> = ({ ... }) => {
  // 组件实现
};
```

## 📈 性能优化

### 组件拆分
- 按功能拆分大型组件
- 提取可复用的子组件
- 使用React.memo优化渲染

### 状态管理
- 合理使用useState和useEffect
- 避免不必要的状态更新
- 使用useCallback和useMemo

### 懒加载
```typescript
// 懒加载组件
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 使用Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

## 🔮 扩展性

### 主题系统
- 支持动态主题切换
- 使用CSS变量和Styled Components
- 主题配置持久化

### 国际化
- 支持多语言
- 动态语言切换
- 本地化资源管理

### 插件系统
- 组件插件接口
- 动态组件加载
- 自定义组件注册

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 