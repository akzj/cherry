// src/store/authStore.ts
import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAuthService } from '@/services/authService';
import type { User } from '@/types';

// 认证状态接口
interface AuthState {
  // 状态标识
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // 数据
  user: User | null;
  token: string | null;
  
  // 方法
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  initialize: () => Promise<void>;
  validateToken: (token: string) => Promise<boolean>;
}

// 定义 persist 中间件的类型（关键修复）
type AuthPersistMiddleware = [
  [
    "zustand/persist", 
    {
      isAuthenticated: boolean;
      user: User | null;
      token: string | null;
      isInitialized: boolean;
    }
  ]
];

// 状态创建器（显式指定中间件类型）
const authStateCreator: StateCreator<
  AuthState,
  [], // 无其他中间件
  AuthPersistMiddleware // 仅使用 persist 中间件
> = (set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
  user: null,
  token: null,

  initialize: async () => {
    try {
      // 懒加载服务
      const { getAuthService } = await import('@/services/authService');
      const authService = getAuthService();
      const state = get();

      if (state.token && state.user) {
        const isValid = await authService.validateToken(state.token);
        if (isValid) {
          set({ isAuthenticated: true, isInitialized: true });
          return;
        }
      }

      // 重置状态
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isInitialized: true,
      });
    } catch (error) {
      console.error('认证初始化失败:', error);
      set({
        isAuthenticated: false,
        isInitialized: true,
        error: '认证初始化失败，请重试',
      });
    }
  },

  login: async (email: string, password: string) => {
    const authService = getAuthService();
    set({ isLoading: true, error: null });

    try {
      const { user, jwt_token } = await authService.login(email, password);
      set({
        isAuthenticated: true,
        user,
        token: jwt_token,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '登录失败';
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: errorMsg,
        isInitialized: true,
      });
    }
  },

  logout: async () => {
    const authService = getAuthService();
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (err) {
      console.warn('注销过程出错:', err);
    } finally {
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        isLoading: false,
        isInitialized: true,
      });
      localStorage.removeItem('auth-storage');
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User) => set({ user }),

  setToken: (token: string) => set({ token }),

  validateToken: async (token: string) => {
    if (!token) return false;
    return getAuthService().validateToken(token);
  },
});

// 创建 store（无类型断言）
export const useAuthStore = create(
  persist(authStateCreator, {
    name: 'auth-storage',
    partialize: (state) => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      token: state.token,
      isInitialized: state.isInitialized,
    }),
    onRehydrateStorage: () => (rehydratedState) => {
      console.log('认证状态从缓存恢复:', rehydratedState);
    },
  })
);

// 便捷 Hooks
export const useAuth = () => {
  const auth = useAuthStore();
  return {
    ...auth,
    isLoggedIn: auth.isAuthenticated && auth.isInitialized,
    isLoading: auth.isLoading || !auth.isInitialized,
  };
};