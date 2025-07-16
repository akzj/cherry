// src/services/authService/mockImpl.ts
import type { AuthService, AuthResult } from './types';
import type { User, UserStatus, CherryMessage } from '@/types';
import { EVT_CHERRY_MSG } from './tauriImpl'; // 复用事件名常量
import { LocalDbAdapter } from '../mock/LocalDbAdapter';

const userDb = new LocalDbAdapter<User>('mock_user');

// Mock 配置（支持更细粒度的控制）
type MockConfig = {
  delay?: number; // 模拟延迟（ms）
  loginSuccess?: boolean; // 登录是否成功
  loginErrorMsg?: string; // 登录失败的自定义消息
  validateSuccess?: boolean; // Token 验证是否成功
  mockUser?: Partial<Omit<User, 'email'>>; // 自定义用户信息（邮箱从参数取）
};

// 全局配置（默认延迟 0，加快测试）
let mockConfig: MockConfig = {
  delay: 0,
  loginSuccess: true,
  loginErrorMsg: '登录失败：模拟后端错误',
  validateSuccess: true,
};

// 更新 Mock 配置
export const setAuthMockConfig = (config: Partial<MockConfig>) => {
  mockConfig = { ...mockConfig, ...config };
};

export async function mockLogin(email: string, password: string): Promise<User> {
  // 1. 尝试从本地读取
  let user = await userDb.read();
  if (user && user.email === email) {
    return user;
  }

  // 2. 没有则生成新用户
  const baseUser: User = {
    id: `mock-user-id-1`,
    user_id: `mock-user-id-2`,
    username: 'Mock User',
    email,
    avatar_url: `https://i.pravatar.cc/200?u=${email}`,
    status: 'online',
  };

  // 3. 写入本地
  await userDb.write(baseUser);

  return baseUser;
}

// Mock 服务实现
export const mockAuthService: AuthService = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    // 模拟网络延迟
    if (mockConfig.delay) {
      await new Promise(resolve => setTimeout(resolve, mockConfig.delay));
    }

    // 模拟登录失败（根据配置，而非随机）
    if (!mockConfig.loginSuccess) {
      throw new Error(mockConfig.loginErrorMsg);
    }

    // 生成模拟用户（不同邮箱对应不同头像）
    const baseUser: User = {
      id: `mock-user-id`,
      user_id: `mock-user-id`,
      username: mockConfig.mockUser?.username || 'Mock User',
      email: email,
      avatar_url: mockConfig.mockUser?.avatar_url || `https://i.pravatar.cc/200?u=${email}`,
      status: mockConfig.mockUser?.status || 'online' as UserStatus,
      ...mockConfig.mockUser,
    };

    // 触发全局事件
    const msg: CherryMessage = {
      message: {
        id: 1,
        conversation_id: 'mock-conversation',
        user_id: baseUser.user_id,
        content: 'Login successful',
        timestamp: new Date().toISOString(),
        type_: 'text'
      }
    };
    window.dispatchEvent(
      new CustomEvent(EVT_CHERRY_MSG, { detail: msg, bubbles: true })
    );

    return {
      user: baseUser,
      jwt_token: `mock-jwt-${Date.now()}`,
    };
  },

  validateToken: async (token: string): Promise<boolean> => {
    return false;
    if (!token) return false; // 空 token 直接无效
    if (mockConfig.delay) {
      await new Promise(resolve => setTimeout(resolve, (mockConfig.delay || 0) / 2)); // 验证延迟短一些
    }
    // 配置控制是否有效，同时模拟 "invalid-token" 字符串永远无效
    return (mockConfig.validateSuccess ?? true) && !token.includes('invalid');
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟异步操作
    // 触发 logout 事件
    window.dispatchEvent(
      new CustomEvent(EVT_CHERRY_MSG, {
        detail: { type: 'logout', payload: null },
        bubbles: true,
      })
    );
  },
};