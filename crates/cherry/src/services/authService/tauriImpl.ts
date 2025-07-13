// src/services/authService/tauriImpl.ts
import { invoke, Channel } from '@tauri-apps/api/core';
import type { AuthService, AuthResult } from './types';
import type { CherryMessage, LoginResponse, User } from '@/types';

// 事件名常量（避免拼写错误）
export const EVT_CHERRY_MSG = 'cherry-message';

// Tauri 环境的真实服务实现
export const tauriAuthService: AuthService = {
    login: async (email: string, password: string): Promise<AuthResult> => {
        const onEvent = new Channel<CherryMessage>();
        onEvent.onmessage = (message) => {
            window.dispatchEvent(
                new CustomEvent(EVT_CHERRY_MSG, { detail: message, bubbles: true })
            );
        };
        const result = await invoke<LoginResponse>('cmd_login', { email, password, onEvent });
        const user: User = {
            id: result.user_id,
            user_id: result.user_id,
            username: result.username,
            email: result.email,
            avatar_url: result.avatar_url,
            status: result.status || 'online', // 默认为 online
        };
        return { user, jwt_token: result.jwt_token };
    },

    validateToken: async (token: string): Promise<boolean> => {
        if (!token) return false;
        return await invoke('cmd_validate_token', { token });
    },

    logout: async (): Promise<void> => {
        // 可选：调用 Tauri 后端的 logout 接口清理服务器状态
        await invoke('cmd_logout').catch(err => {
            console.warn('后端注销接口调用失败:', err);
        });
    },
};