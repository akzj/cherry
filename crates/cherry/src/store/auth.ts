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
  validateToken: (token: string) => Promise<boolean>;
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
      initialize: async () => {
        const state = get();
        console.log('Initializing auth state:', state);
        
        // 检查是否有有效的 token 和用户信息
        if (state.token && state.user) {
          // 验证token是否有效
          const isValid = await get().validateToken(state.token);
          if (isValid) {
            console.log('Found valid auth data, marking as authenticated');
            set({ isInitialized: true });
          } else {
            console.log('Token validation failed, clearing state');
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isInitialized: true,
            });
          }
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
          console.log('Starting login process with:', { email, password });
          
          // 创建事件通道用于接收消息
          const onEvent = new Channel<CherryMessage>();
          
          // 设置事件监听器
          onEvent.onmessage = (message) => {
            console.log('Received message from backend:', message);
            try {
              // 触发全局事件，供其他组件监听
              window.dispatchEvent(new CustomEvent('cherry-message', { 
                detail: message,
                bubbles: true, // 允许事件冒泡
                cancelable: true // 允许事件被取消
              }));
            } catch (error) {
              console.error('Failed to dispatch cherry-message event:', error);
            }
          };
          
          console.log('Calling Tauri cmd_login...');
          
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
          
          console.log('Tauri cmd_login returned:', userInfo);
          
          if (!userInfo || !userInfo.user_id || !userInfo.jwt_token) {
            throw new Error('Invalid response from login command');
          }
          
          const user: User = {
            user_id: userInfo.user_id,
            username: userInfo.username,
            email: userInfo.email,
            avatar_url: userInfo.avatar_url,
            status: userInfo.status,
          };

          console.log('Creating user object:', user);

          // 使用回调方式确保状态更新
          set(() => {
            const newState = {
              isAuthenticated: true,
              user,
              token: userInfo.jwt_token,
              isLoading: false,
              error: null,
              isInitialized: true,
            };
            
            console.log('Login successful, updating state:', newState);
            return newState;
          });
          
          // 添加调试日志
          console.log('Login successful, state updated:', {
            isAuthenticated: true,
            user,
            token: userInfo.jwt_token,
            isInitialized: true
          });
          
          // 延迟检查状态更新
          setTimeout(() => {
            const updatedState = get();
            console.log('Delayed auth state check:', updatedState);
          }, 100);
        } catch (error) {
          console.error('Login error details:', error);
          
          let errorMessage = 'Login failed';
          
          if (error instanceof Error) {
            errorMessage = error.message;
            console.error('Error name:', error.name);
            console.error('Error stack:', error.stack);
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else {
            console.error('Unknown error type:', typeof error, error);
          }
          
          console.log('Setting error state:', errorMessage);
          
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

      // 验证token
      validateToken: async (token: string) => {
        try {
          console.log('Calling Tauri cmd_validate_token...');
          
          // 调用Tauri命令验证token
          const isValid = await invoke('cmd_validate_token', { token }) as boolean;
          
          console.log('Tauri cmd_validate_token returned:', isValid);
          
          return isValid;
        } catch (error) {
          console.error('Token validation error:', error);
          
          return false;
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        isInitialized: state.isInitialized,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Auth state rehydrated:', state);
      },
    }
  )
);

// 导出便捷的hooks
export const useAuth = () => {
  const auth = useAuthStore();
  
  const isLoggedIn = auth.isAuthenticated && auth.isInitialized;
  const isLoading = auth.isLoading || !auth.isInitialized;
  
  return {
    ...auth,
    // 便捷的getter
    user: auth.user,
    token: auth.token,
    isLoggedIn,
    isLoading,
  };
}; 