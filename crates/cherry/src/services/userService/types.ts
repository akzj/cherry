import { User } from '@/types';

export interface UserService {
    getUserInfo(userId: string): Promise<User | null>;
    getUserName(userId: string, groupId?: string): Promise<string>;
    /**
     * 获取当前用户信息
     */
    getCurrentUser(): Promise<User | null>;
}