import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';

// 用户信息接口
export interface User {
  user_id: string;
  username: string;
  email: string;
  avatar_url?: string;
  status: string;
}

// 认证状态接口
interface AuthState {
  // 状态
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 数据
  user: User | null;
  token: string | null;
  
  // 方法
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      token: null,

      // 登录方法
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // 调用Tauri命令进行登录
          const userInfo = await invoke('cmd_login', { username, password }) as {
            user_id: string;
            username: string;
            email: string;
            avatar_url?: string;
            status: string;
            jwt_token: string;
          };
          
          const user: User = {
            user_id: userInfo.user_id,
            username: userInfo.username,
            email: userInfo.email,
            avatar_url: userInfo.avatar_url,
            status: userInfo.status,
          };

          set({
            isAuthenticated: true,
            user,
            token: userInfo.jwt_token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          let errorMessage = 'Login failed';
          
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // 登出方法
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 设置用户信息
      setUser: (user: User) => {
        set({ user });
      },

      // 设置token
      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// 导出便捷的hooks
export const useAuth = () => {
  const auth = useAuthStore();
  
  return {
    ...auth,
    // 便捷的getter
    user: auth.user,
    token: auth.token,
    isLoggedIn: auth.isAuthenticated,
  };
}; 