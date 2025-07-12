



// 用户状态枚举（显式限定取值）
export type UserStatus = 'online' | 'offline' | 'busy' | 'away';

// 用户信息（使用枚举类型）
export interface User {
  user_id: string;
  username: string;
  email: string;
  avatar_url?: string;
  status: UserStatus; // 限定为枚举值
}

export { parseMessageContent } from './utils.ts';