// API相关类型定义

import { ApiResponse, ApiError, Timestamp } from './core';

/**
 * 认证相关类型
 */
export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

// LoginResponse从models/login.ts导入，避免重复定义

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

/**
 * 用户相关API类型
 */
// 从models/user.ts导入，避免重复定义

/**
 * 认证状态类型
 */
// 从models/user.ts导入User类型
import { User } from './models/user';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

/**
 * API请求配置类型
 */
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * API请求拦截器类型
 */
export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRequestError?: (error: ApiError) => any;
}

/**
 * API响应拦截器类型
 */
export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onResponseError?: (error: ApiError) => any;
}

/**
 * WebSocket消息类型
 */
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: Timestamp;
  id?: string;
}

/**
 * 流事件类型
 */
// StreamEvent从models/message.ts导入，避免重复定义

/**
 * Cherry消息类型 - 匹配后端格式
 */
// 从models/message.ts导入，避免重复定义 