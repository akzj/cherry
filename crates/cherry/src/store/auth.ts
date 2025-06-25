import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke, Channel } from '@tauri-apps/api/core';
import { CherryMessage } from '../types/types';

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
  isInitialized: boolean;
  
  // 数据
  user: User | null;
  token: string | null;
  
  // 方法
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  initialize: () => void;
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,
      user: null,
      token: null,

      // 初始化方法
      initialize: () => {
        const state = get();
        console.log('Initializing auth state:', state);
        
        // 检查是否有有效的 token 和用户信息
        if (state.token && state.user) {
          // 这里可以添加 token 验证逻辑
          console.log('Found existing auth data, marking as initialized');
          set({ isInitialized: true });
        } else {
          // 如果没有有效信息，清除状态并标记为已初始化
          console.log('No valid auth data found, clearing state');
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isInitialized: true,
          });
        }
      },

      // 登录方法
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // 创建事件通道用于接收消息
          const onEvent = new Channel<CherryMessage>();
          
          // 设置事件监听器
          onEvent.onmessage = (message) => {
            console.log('Received message from backend:', message);
            // 触发全局事件，供其他组件监听
            window.dispatchEvent(new CustomEvent('cherry-message', { detail: message }));
          };
          
          // 调用Tauri命令进行登录，传递事件通道
          const userInfo = await invoke('cmd_login', { 
            email, 
            password,
            onEvent 
          }) as {
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
            isInitialized: true,
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
            isInitialized: true,
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
          isInitialized: true,
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
    isLoggedIn: auth.isAuthenticated && auth.isInitialized,
    isLoading: auth.isLoading || !auth.isInitialized,
  };
}; 