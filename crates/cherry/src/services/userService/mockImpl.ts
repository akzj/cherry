// src/services/userService/mockImpl.ts
import type { UserService } from './types';
import type { User } from '@/types';
import { LocalDbAdapter } from '../mock/LocalDbAdapter';

// 用户数据存储结构
export type UserDbData = {
    users: User[];
    userGroups: Record<string, { userId: string; groupId: string; displayName: string }[]>;
};

// 创建用户数据库适配器
const userDb = new LocalDbAdapter<UserDbData>(
    'mock-user-db',
    JSON.stringify,
    JSON.parse
);

// 默认用户数据
const defaultUserDb: UserDbData = {
    users: [
        {
            id: 'mock-user-id',
            user_id: 'mock-user-id',
            username: 'Mock User',
            name: 'Mock User',
            email: 'mock@example.com',
            avatar: 'https://i.pravatar.cc/150?u=mock@example.com',
            avatar_url: 'https://i.pravatar.cc/150?u=mock@example.com',
            status: 'online'
        },
        {
            id: 'user-alice',
            user_id: 'user-alice',
            username: 'Alice Johnson',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            avatar: 'https://i.pravatar.cc/150?u=alice@example.com',
            avatar_url: 'https://i.pravatar.cc/150?u=alice@example.com',
            status: 'online'
        },
        {
            id: 'user-bob',
            user_id: 'user-bob',
            username: 'Bob Smith',
            name: 'Bob Smith',
            email: 'bob@example.com',
            avatar: 'https://i.pravatar.cc/150?u=bob@example.com',
            avatar_url: 'https://i.pravatar.cc/150?u=bob@example.com',
            status: 'away'
        }
    ],
    userGroups: {
        'group-1': [
            { userId: 'user-alice', groupId: 'group-1', displayName: 'Alice (Team Lead)' },
            { userId: 'user-bob', groupId: 'group-1', displayName: 'Bob (Developer)' }
        ],
        'group-2': [
            { userId: 'user-alice', groupId: 'group-2', displayName: 'Alice' },
            { userId: 'mock-user-id', groupId: 'group-2', displayName: 'Me' }
        ]
    }
};

// Mock 配置
let mockConfig = {
    delay: 300,
    shouldFail: false,
    failureRate: 0.1
};

export const setMockConfig = (config: Partial<typeof mockConfig>) => {
    mockConfig = { ...mockConfig, ...config };
};

// 初始化数据库
const initializeDb = async () => {
    const data = await userDb.read();
    if (!data) {
        await userDb.write(defaultUserDb);
    }
};

// 用户服务 Mock 实现
export const mockUserService: UserService = {
    async getUserName(userId: string, groupId: string): Promise<string> {
        if (!userId) {
            throw new Error('User ID is required');
        }

        if (userId == window.__USER__?.user_id) {
            return window.__USER__.name || window.__USER__.username;
        }

        // 模拟延迟
        if (mockConfig.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, mockConfig.delay));
        }

        // // 模拟随机失败
        // if (mockConfig.shouldFail || Math.random() < mockConfig.failureRate) {
        //     throw new Error(`Failed to get user name for ${userId} in group ${groupId}`);
        // }

        // 初始化数据库
        await initializeDb();

        // 读取数据
        const data = await userDb.read();
        if (!data) {
            throw new Error('User database not initialized');
        }

        // 首先检查用户是否在特定群组中有自定义显示名
        const groupUsers = data.userGroups[groupId];
        if (groupUsers) {
            const userInGroup = groupUsers.find(u => u.userId === userId);
            if (userInGroup) {
                return userInGroup.displayName;
            }
        }

        // 如果没有群组特定名称，返回用户的默认名称
        const user = data.users.find(u => u.id === userId);
        if (user) {
            return user.name || user.username;
        }

        // 如果用户不存在，返回默认名称
        return `User ${userId}`;
    },
    getCurrentUser: async (): Promise<User | null> => {
        return window.__USER__ ?? null;
    },
    getUserInfo: async (userId: string): Promise<User | null> => {
        if (!userId) {
            throw new Error('User ID is required');
        }

        // 模拟延迟
        if (mockConfig.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, mockConfig.delay));
        }

        // // 模拟随机失败
        // if (mockConfig.shouldFail || Math.random() < mockConfig.failureRate) {
        //     throw new Error(`Failed to get user info for ${userId}`);
        // }

        // 初始化数据库
        await initializeDb();

        // 读取数据
        const data = await userDb.read();
        if (!data) {
            throw new Error('User database not initialized');
        }

        // 查找用户信息
        return data.users.find(user => user.id === userId) || null;
    }
};

// 导出用于测试的工具函数
export const getUserDb = () => userDb;
export const resetUserDb = () => userDb.reset(defaultUserDb);