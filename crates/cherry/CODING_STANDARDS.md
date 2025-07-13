# Cherry 开发规范

## 📋 概述

本文档定义了Cherry项目的开发规范，包括代码风格、命名规范、架构原则、测试要求等，确保团队开发的一致性和代码质量。

## 🎯 规范目标

- **一致性**: 确保代码风格和结构的一致性
- **可读性**: 提高代码的可读性和可维护性
- **可扩展性**: 支持项目的长期发展和扩展
- **质量保证**: 通过规范提高代码质量
- **团队协作**: 降低团队协作成本

## 📝 代码风格规范

### TypeScript规范

#### 类型定义
```typescript
// ✅ 推荐：使用接口定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ✅ 推荐：使用类型别名定义联合类型
type Status = 'loading' | 'success' | 'error';

// ✅ 推荐：使用泛型定义通用类型
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// ❌ 避免：使用any类型
const data: any = fetchData();

// ✅ 推荐：使用unknown或具体类型
const data: unknown = fetchData();
const userData: User = data as User;
```

#### 函数定义
```typescript
// ✅ 推荐：使用箭头函数
const fetchUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// ✅ 推荐：使用函数重载
function processData(data: string): string;
function processData(data: number): number;
function processData(data: string | number): string | number {
  return typeof data === 'string' ? data.toUpperCase() : data * 2;
}

// ✅ 推荐：使用可选参数和默认值
const createUser = (
  name: string,
  email: string,
  avatar?: string,
  role: UserRole = 'user'
): User => {
  return { id: generateId(), name, email, avatar, role };
};
```

#### 变量声明
```typescript
// ✅ 推荐：使用const声明不会改变的变量
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;

// ✅ 推荐：使用let声明会改变的变量
let retryCount = 0;
let currentUser: User | null = null;

// ❌ 避免：使用var
var oldVariable = 'deprecated';

// ✅ 推荐：使用解构赋值
const { name, email, avatar } = user;
const [first, second, ...rest] = items;
```

### React规范

#### 组件定义
```typescript
// ✅ 推荐：使用函数式组件
interface ComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction, 
  children 
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
      {children}
    </div>
  );
};

// ✅ 推荐：使用React.memo优化性能
const ExpensiveComponent = React.memo<ComponentProps>(({ data }) => {
  return <div>{/* 复杂渲染逻辑 */}</div>;
});

// ✅ 推荐：使用forwardRef
const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, ...props }, ref) => {
    return <input ref={ref} placeholder={placeholder} {...props} />;
  }
);
```

#### Hooks使用
```typescript
// ✅ 推荐：自定义Hook
const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getUser(userId);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};

// ✅ 推荐：使用useCallback优化性能
const handleClick = useCallback(() => {
  onAction?.();
}, [onAction]);

// ✅ 推荐：使用useMemo缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

#### 状态管理
```typescript
// ✅ 推荐：使用Zustand Store
const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  
  fetchUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const user = await userService.getUser(id);
      set({ user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        loading: false 
      });
    }
  },
}));

// ✅ 推荐：使用选择器优化性能
const user = useUserStore(state => state.user);
const loading = useUserStore(state => state.loading);
```

### 样式规范

#### Styled Components
```typescript
// ✅ 推荐：基础样式组件
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 8px;
  background-color: ${props => props.theme.colors.background};
`;

// ✅ 推荐：条件样式
const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  background-color: ${props => 
    props.$variant === 'primary' ? '#007bff' : '#6c757d'
  };
  color: white;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

// ✅ 推荐：主题样式
const ThemedComponent = styled.div`
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
`;

// ✅ 推荐：使用CSS变量
const ModernComponent = styled.div`
  color: var(--text-color);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
`;
```

## 🏗️ 架构规范

### 文件组织
```
src/
├── components/           # UI组件
│   ├── UI/             # 基础UI组件
│   ├── Feature/        # 功能组件
│   └── Layout/         # 布局组件
├── services/           # 服务层
│   ├── authService/
│   ├── contactService/
│   └── messageService/
├── store/              # 状态管理
├── types/              # 类型定义
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
└── assets/             # 静态资源
```

### 命名规范

#### 文件命名
```typescript
// ✅ 推荐：使用PascalCase命名组件文件
UserProfile.tsx
MessageInput.tsx
ContactList.tsx

// ✅ 推荐：使用camelCase命名工具文件
formatDate.ts
validateEmail.ts
apiClient.ts

// ✅ 推荐：使用kebab-case命名样式文件
user-profile.styles.ts
message-input.styles.ts

// ✅ 推荐：使用描述性名称
useUserAuthentication.ts  // 而不是 useAuth.ts
handleMessageSubmission.ts // 而不是 handleSubmit.ts
```

#### 变量命名
```typescript
// ✅ 推荐：使用描述性名称
const userProfile = getUserProfile();
const messageList = getMessageList();
const isAuthenticated = checkAuthentication();

// ❌ 避免：使用缩写或单字母
const u = getUser();
const msg = getMessage();
const auth = checkAuth();

// ✅ 推荐：布尔值使用is/has/can前缀
const isLoading = true;
const hasPermission = false;
const canEdit = true;

// ✅ 推荐：常量使用UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
```

#### 函数命名
```typescript
// ✅ 推荐：使用动词开头
const fetchUserData = async () => { /* ... */ };
const updateUserProfile = async (data: UserData) => { /* ... */ };
const validateEmail = (email: string) => { /* ... */ };

// ✅ 推荐：事件处理函数使用handle前缀
const handleSubmit = (event: FormEvent) => { /* ... */ };
const handleClick = () => { /* ... */ };
const handleChange = (value: string) => { /* ... */ };

// ✅ 推荐：异步函数使用async/await
const loadUserData = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to load user data');
  }
};
```

### 导入规范

#### 导入顺序
```typescript
// 1. React相关
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';

// 3. 项目内部模块
import { User } from '@/types';
import { userService } from '@/services/userService';
import { useUserStore } from '@/store/user';

// 4. 相对路径导入
import './Component.styles.css';
```

#### 导入方式
```typescript
// ✅ 推荐：使用命名导入
import { useState, useEffect } from 'react';
import { User, Message } from '@/types';

// ✅ 推荐：使用默认导入
import React from 'react';
import styled from 'styled-components';

// ✅ 推荐：使用别名避免冲突
import { Button as StyledButton } from './Button.styles';
import { Button as UIButton } from '@/components/UI/Button';

// ❌ 避免：使用通配符导入
import * as React from 'react';
```

## 🧪 测试规范

### 单元测试
```typescript
// ✅ 推荐：组件测试
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});

// ✅ 推荐：Hook测试
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});

// ✅ 推荐：工具函数测试
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-01-01');
    const formatted = formatDate(date);
    expect(formatted).toBe('2023-01-01');
  });
});
```

### 集成测试
```typescript
// ✅ 推荐：服务测试
import { userService } from './userService';

describe('UserService', () => {
  it('should fetch user from API', async () => {
    const user = await userService.getUser('user-1');
    
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
  });

  it('should handle API errors', async () => {
    await expect(userService.getUser('invalid-id')).rejects.toThrow();
  });
});
```

### 测试覆盖率要求
- **单元测试覆盖率**: ≥ 80%
- **集成测试覆盖率**: ≥ 60%
- **E2E测试覆盖率**: ≥ 40%

## 🔧 工具配置

### ESLint配置
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Prettier配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### TypeScript配置
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true
  }
}
```

## 📝 注释规范

### 代码注释
```typescript
/**
 * 用户服务接口
 * 
 * 提供用户相关的API操作，包括获取用户信息、更新用户资料等
 * 
 * @example
 * ```typescript
 * const user = await userService.getUser('user-1');
 * await userService.updateUser('user-1', { name: 'New Name' });
 * ```
 */
interface UserService {
  /**
   * 获取用户信息
   * 
   * @param id 用户ID
   * @returns 用户信息
   * @throws {Error} 当用户不存在时抛出错误
   */
  getUser(id: string): Promise<User>;
  
  /**
   * 更新用户信息
   * 
   * @param id 用户ID
   * @param updates 更新的字段
   * @returns 更新后的用户信息
   */
  updateUser(id: string, updates: Partial<User>): Promise<User>;
}

// 复杂逻辑的注释
const processUserData = (users: User[]) => {
  // 过滤掉已删除的用户
  const activeUsers = users.filter(user => !user.deleted);
  
  // 按创建时间排序，最新的在前
  const sortedUsers = activeUsers.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return sortedUsers;
};
```

### 组件文档
```typescript
/**
 * Button组件
 * 
 * 通用按钮组件，支持多种样式和状态
 * 
 * @example
 * ```tsx
 * <Button 
 *   type="primary" 
 *   size="medium" 
 *   onClick={handleClick}
 *   loading={isLoading}
 * >
 *   Click Me
 * </Button>
 * ```
 */
const Button: React.FC<ButtonProps> = ({ 
  type = 'primary',
  size = 'medium',
  onClick,
  loading = false,
  children,
  ...props 
}) => {
  // 组件实现
};
```

## 🔄 Git工作流

### 分支策略
```
main                    # 主分支，生产环境
├── develop            # 开发分支
├── feature/xxx        # 功能分支
├── bugfix/xxx         # 修复分支
└── release/xxx        # 发布分支
```

### 提交规范
```bash
# 提交格式
<type>(<scope>): <subject>

# 类型
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式
refactor: 重构
test:     测试
chore:    构建过程或辅助工具的变动

# 示例
feat(auth): add login functionality
fix(message): resolve message sending issue
docs(readme): update installation guide
refactor(store): simplify user store implementation
test(button): add unit tests for button component
```

### 代码审查清单
- [ ] 代码符合项目规范
- [ ] 类型定义完整
- [ ] 测试覆盖充分
- [ ] 文档更新及时
- [ ] 性能影响评估
- [ ] 安全性检查

## 🚀 性能规范

### 组件优化
```typescript
// ✅ 推荐：使用React.memo避免不必要的重渲染
const ExpensiveComponent = React.memo<ComponentProps>(({ data }) => {
  return <div>{/* 复杂渲染逻辑 */}</div>;
});

// ✅ 推荐：使用useCallback缓存函数
const handleClick = useCallback(() => {
  onAction?.();
}, [onAction]);

// ✅ 推荐：使用useMemo缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ 推荐：使用懒加载
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

### 状态优化
```typescript
// ✅ 推荐：使用选择器避免不必要的重渲染
const user = useUserStore(state => state.user);
const loading = useUserStore(state => state.loading);

// ✅ 推荐：使用浅比较
const user = useUserStore(
  state => state.user,
  (prev, next) => prev.id === next.id
);

// ✅ 推荐：局部状态管理
const [localState, setLocalState] = useState();
```

## 🔒 安全规范

### 数据验证
```typescript
// ✅ 推荐：输入验证
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ 推荐：数据清理
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// ✅ 推荐：类型守卫
const isUser = (data: unknown): data is User => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data
  );
};
```

### 错误处理
```typescript
// ✅ 推荐：统一错误处理
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

// ✅ 推荐：错误边界
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## 📊 质量指标

### 代码质量要求
- **圈复杂度**: ≤ 10
- **函数长度**: ≤ 50行
- **文件长度**: ≤ 500行
- **重复代码**: ≤ 3%

### 性能要求
- **首屏加载时间**: ≤ 2秒
- **交互响应时间**: ≤ 100ms
- **内存使用**: 合理范围内
- **包大小**: 优化后 ≤ 2MB

### 可访问性要求
- **WCAG 2.1 AA**: 符合标准
- **键盘导航**: 支持完整键盘操作
- **屏幕阅读器**: 兼容主流屏幕阅读器
- **颜色对比度**: 符合可访问性标准

## 🔄 持续改进

### 定期审查
- **代码审查**: 每次提交前进行代码审查
- **架构审查**: 每月进行架构审查
- **性能审查**: 每季度进行性能审查
- **安全审查**: 每半年进行安全审查

### 反馈机制
- **开发者反馈**: 收集开发者对规范的反馈
- **工具改进**: 根据使用情况改进工具配置
- **规范更新**: 定期更新开发规范
- **培训计划**: 定期进行规范培训

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 