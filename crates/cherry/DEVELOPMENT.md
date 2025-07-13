# Cherry 开发指南

## 📋 概述

本文档为Cherry项目的开发指南，包含开发环境设置、代码规范、测试指南、部署流程等内容，帮助开发者快速上手项目开发。

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Rust**: >= 1.70.0
- **Tauri CLI**: >= 1.5.0

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd cherry

# 安装前端依赖
cd crates/cherry
npm install

# 安装Tauri依赖
npm run tauri install
```

### 启动开发服务器

```bash
# 启动前端开发服务器
npm run dev

# 启动Tauri开发模式
npm run tauri dev
```

## 🏗️ 项目结构

```
cherry/
├── crates/
│   ├── cherry/              # 前端应用
│   │   ├── src/
│   │   │   ├── components/  # UI组件
│   │   │   ├── services/    # 服务层
│   │   │   ├── store/       # 状态管理
│   │   │   ├── types/       # 类型定义
│   │   │   ├── hooks/       # 自定义Hooks
│   │   │   └── utils/       # 工具函数
│   │   ├── src-tauri/       # Tauri后端
│   │   └── package.json
│   ├── cherrycore/          # 核心库
│   ├── cherryserver/        # 后端服务
│   ├── fileserver/          # 文件服务
│   ├── streamserver/        # 流媒体服务
│   └── streamstore/         # 流存储
├── docker-compose.dev.yml   # 开发环境Docker配置
└── README.md
```

## 📝 代码规范

### TypeScript规范

#### 类型定义
```typescript
// 使用接口定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// 使用类型别名定义联合类型
type Status = 'loading' | 'success' | 'error';

// 使用泛型定义通用类型
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

#### 函数定义
```typescript
// 使用箭头函数
const fetchUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// 使用函数重载
function processData(data: string): string;
function processData(data: number): number;
function processData(data: string | number): string | number {
  return typeof data === 'string' ? data.toUpperCase() : data * 2;
}
```

#### 组件定义
```typescript
// 使用函数式组件
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### React规范

#### Hooks使用
```typescript
// 自定义Hook
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};
```

#### 状态管理
```typescript
// 使用Zustand Store
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
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 样式规范

#### Styled Components
```typescript
// 基础样式组件
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

// 条件样式
const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  
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
`;

// 主题样式
const ThemedComponent = styled.div`
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
`;
```

### 文件命名规范

```
# 组件文件
ComponentName.tsx              # 主组件
ComponentName.styles.ts        # 样式文件
ComponentName.test.tsx         # 测试文件
ComponentName.stories.tsx      # Storybook故事

# 服务文件
serviceName/
├── types.ts                  # 类型定义
├── tauriImpl.ts             # Tauri实现
├── mockImpl.ts              # Mock实现
└── index.ts                 # 导出入口

# 类型文件
types/
├── models/
│   ├── user.ts              # 用户类型
│   ├── message.ts           # 消息类型
│   └── index.ts             # 统一导出
├── core.ts                  # 核心类型
└── index.ts                 # 主入口
```

## 🧪 测试指南

### 单元测试

#### 组件测试
```typescript
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
```

#### Hook测试
```typescript
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

  it('should reset counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(0);
  });
});
```

#### Store测试
```typescript
import { renderHook, act } from '@testing-library/react';
import { useUserStore } from './userStore';

describe('UserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      loading: false,
      error: null,
    });
  });

  it('should fetch user', async () => {
    const { result } = renderHook(() => useUserStore());
    
    await act(async () => {
      await result.current.fetchUser('user-1');
    });
    
    expect(result.current.user).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
```

### 集成测试

#### API测试
```typescript
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

### E2E测试

#### Playwright测试
```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-name"]')).toContainText('User');
});
```

## 🔧 开发工具

### VS Code配置

#### 推荐扩展
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "styled-components.vscode-styled-components",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-jest",
    "ms-playwright.playwright"
  ]
}
```

#### 工作区设置
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "styled-css"
  }
}
```

### 调试配置

#### 前端调试
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:1420",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

#### Tauri调试
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Tauri Debug",
      "type": "lldb",
      "request": "launch",
      "program": "${workspaceFolder}/src-tauri/target/debug/cherry",
      "args": [],
      "cwd": "${workspaceFolder}/src-tauri"
    }
  ]
}
```

## 📦 构建和部署

### 开发构建
```bash
# 构建前端
npm run build

# 构建Tauri应用
npm run tauri build
```

### 生产构建
```bash
# 构建生产版本
npm run build:prod

# 构建Tauri生产版本
npm run tauri build --release
```

### Docker部署
```bash
# 构建Docker镜像
docker build -t cherry .

# 运行Docker容器
docker run -p 3000:3000 cherry
```

## 🐛 调试指南

### 常见问题

#### 类型错误
```typescript
// 问题：类型不匹配
const user: User = { id: 1, name: 'John' }; // Error: id should be string

// 解决：确保类型匹配
const user: User = { id: '1', name: 'John' };
```

#### 状态更新问题
```typescript
// 问题：状态更新不生效
const [count, setCount] = useState(0);
setCount(count + 1); // 可能不会更新

// 解决：使用函数式更新
setCount(prev => prev + 1);
```

#### 异步操作问题
```typescript
// 问题：组件卸载后状态更新
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getData();
    setData(data); // 可能组件已卸载
  };
  fetchData();
}, []);

// 解决：使用清理函数
useEffect(() => {
  let mounted = true;
  const fetchData = async () => {
    const data = await api.getData();
    if (mounted) {
      setData(data);
    }
  };
  fetchData();
  return () => { mounted = false; };
}, []);
```

### 性能优化

#### 组件优化
```typescript
// 使用React.memo避免不必要的重渲染
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* 复杂渲染逻辑 */}</div>;
});

// 使用useCallback缓存函数
const handleClick = useCallback(() => {
  // 处理点击事件
}, [dependencies]);

// 使用useMemo缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

#### 状态优化
```typescript
// 使用选择器避免不必要的重渲染
const user = useUserStore(state => state.user);
const loading = useUserStore(state => state.loading);

// 使用浅比较
const user = useUserStore(
  state => state.user,
  (prev, next) => prev.id === next.id
);
```

## 📚 文档规范

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
const Button: React.FC<ButtonProps> = ({ ... }) => {
  // 组件实现
};
```

## 🔄 工作流程

### Git工作流

#### 分支策略
```
main                    # 主分支，生产环境
├── develop            # 开发分支
├── feature/xxx        # 功能分支
├── bugfix/xxx         # 修复分支
└── release/xxx        # 发布分支
```

#### 提交规范
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
```

### 代码审查

#### 审查清单
- [ ] 代码符合项目规范
- [ ] 类型定义完整
- [ ] 测试覆盖充分
- [ ] 文档更新及时
- [ ] 性能影响评估
- [ ] 安全性检查

#### 审查流程
1. 创建Pull Request
2. 自动检查通过
3. 代码审查
4. 测试通过
5. 合并到主分支

## 🚀 发布流程

### 版本管理

#### 语义化版本
```bash
# 版本格式：主版本.次版本.修订版本
1.0.0    # 主版本：不兼容的API修改
1.1.0    # 次版本：向下兼容的功能性新增
1.1.1    # 修订版本：向下兼容的问题修正
```

#### 发布步骤
1. 更新版本号
2. 更新CHANGELOG
3. 创建发布标签
4. 构建发布版本
5. 部署到生产环境

### 自动化部署

#### CI/CD配置
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm run tauri build --release
```

---

**文档版本**: 1.0.0  
**最后更新**: 2025-07-13  
**维护者**: Cherry Team 