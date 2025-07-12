


// 设置项类型
export type SettingCategory = 'general' | 'privacy' | 'notifications' | 'appearance';

// 主题类型
export type ThemePreference = 'light' | 'dark' | 'system';

// 通用设置
export interface GeneralSettings {
  startup: boolean;
  language: string;
  sendWithEnter: boolean;
}

// 隐私设置
export interface PrivacySettings {
  readReceipts: boolean;
  onlineStatus: 'all' | 'contacts' | 'none';
  messageHistory: 'forever' | '30days' | '7days';
}

// 通知设置
export interface NotificationSettings {
  messageAlerts: boolean;
  sound: boolean;
  vibration: boolean;
  previewContent: boolean;
}

// 外观设置
export interface AppearanceSettings {
  theme: ThemePreference;
  fontSize: number;
  density: 'compact' | 'normal' | 'spacious';
}

