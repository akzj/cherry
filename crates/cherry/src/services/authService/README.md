# AuthService 服务说明

## 接口定义

见 `types.ts`：

```typescript
export interface AuthService {
  login: (email: string, password: string) => Promise<AuthResult>;
  validateToken: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

## Mock 实现说明
- mockImpl.ts 提供本地模拟登录、token校验、登出等能力。
- 支持本地用户数据模拟，便于前端开发和测试。

## Tauri 实现说明
- tauriImpl.ts 通过 Tauri invoke 调用后端命令。
- 命令包括：`cmd_auth_login`、`cmd_auth_validate_token`、`cmd_auth_logout`。

## 用法示例

```typescript
import { getAuthService } from '@/services/authService';

const authService = getAuthService();

async function login(email: string, password: string) {
  const result = await authService.login(email, password);
  console.log(result.user, result.jwt_token);
}

async function logout() {
  await authService.logout();
}
```

## 错误处理
- 所有方法均为 async，遇到错误时抛出异常。
- 建议业务层统一 try/catch 处理。

## mock/tauri 切换
- 通过 `isTauriEnv` 自动切换。
- 业务代码无需关心环境，直接用 `getAuthService()`。 