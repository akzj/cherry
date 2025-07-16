



// 用户状态枚举（显式限定取值）
export type UserStatus = 'online' | 'offline' | 'busy' | 'away';

// 用户信息（使用枚举类型）
export interface User {
  id: string;           // 用户ID
  user_id: string;      // 兼容旧版本
  username: string;     // 用户名
  name?: string;        // 显示名称
  remark?: string;      // 备注
  email: string;        // 邮箱
  avatar?: string;      // 头像URL
  avatar_url?: string;  // 兼容旧版本
  status: UserStatus;   // 用户状态
}

// parseMessageContent函数已移动到typeUtils.ts