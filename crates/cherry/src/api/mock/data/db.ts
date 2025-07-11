// src/api/mock/db.ts
import { Message } from '@/types';
import { Low } from 'lowdb';

// 定义数据结构
type Data = {
  users: { id: number; name: string; email: string }[];
  files: { id: string; content: string }[];
  messagesMap: Record<string, Message[]>;
};

// 增强版 AsyncLocalStorage 适配器
class EnhancedAsyncLocalStorage<T> {
  private key: string;
  private serialize: (data: T) => string;
  private deserialize: (data: string) => T;

  constructor(
    key: string,
    serialize: (data: T) => string = JSON.stringify,
    deserialize: (data: string) => T = JSON.parse
  ) {
    this.key = key;
    this.serialize = serialize;
    this.deserialize = deserialize;
  }

  async read(): Promise<T | null> {
    try {
      const data = localStorage.getItem(this.key);
      return data ? this.deserialize(data) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  async write(data: T): Promise<void> {
    try {
      localStorage.setItem(this.key, this.serialize(data));
    } catch (error) {
      console.error('Failed to write to localStorage:', error);
      throw error;
    }
  }
}

// 创建适配器实例
const adapter = new EnhancedAsyncLocalStorage<Data>('mock-db');

// 初始化数据库并设置默认值
const db = new Low<Data>(adapter, { users: [], files: [], messagesMap: {} });

// 初始化数据（添加错误处理）
async function initDb() {
  try {
    await db.read();
    // 如果数据为空，添加一些默认测试数据
    if (!db.data.users.length) {
      db.data.users.push({ id: 1, name: 'Alice', email: 'alice@example.com' });
    }
    await db.write();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// 添加数据重置功能（用于测试）
async function resetDb() {
  db.data = { users: [], files: [], messagesMap: {} };
  await db.write();
}

export { db, initDb, resetDb };