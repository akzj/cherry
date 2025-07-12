
// src/services/authService/types.ts
import type { User } from '@/types';

// 登录结果接口（独立命名，方便复用）
export interface AuthResult {
  user: User;
  jwt_token: string;
}

// 认证服务接口（logout 改为必实现）
export interface AuthService {
  login: (email: string, password: string) => Promise<AuthResult>;
  validateToken: (token: string) => Promise<boolean>;
  logout: () => Promise<void>; // 必实现（允许空操作）
}