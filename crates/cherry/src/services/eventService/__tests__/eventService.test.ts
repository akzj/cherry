import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockEventService } from '../mockImpl';
import { getEventService, resetEventService, createEventService } from '../index';

describe('Extended Event Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetEventService(); // 重置服务实例
  });

  it('should listen to events and call listeners', async () => {
    const mockListener = vi.fn();
    const eventName = 'test-event';
    
    // 监听事件
    const unlisten = await mockEventService.listen(eventName, mockListener);
    
    // 触发事件
    const testPayload = { message: { id: 1, conversation_id: 'test', user_id: 'user1', content: 'test', timestamp: '2024-01-01', type_: 'text' as const } };
    mockEventService.emit(eventName, testPayload);
    
    // 验证监听器被调用
    expect(mockListener).toHaveBeenCalledWith(testPayload);
    
    // 取消监听
    unlisten();
    
    // 再次触发事件，监听器不应该被调用
    mockEventService.emit(eventName, { message: { id: 2, conversation_id: 'test', user_id: 'user1', content: 'ignored', timestamp: '2024-01-01', type_: 'text' as const } });
    expect(mockListener).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple listeners for the same event', async () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const eventName = 'multi-event';
    
    // 添加两个监听器
    const unlisten1 = await mockEventService.listen(eventName, listener1);
    const unlisten2 = await mockEventService.listen(eventName, listener2);
    
    // 触发事件
    const testPayload = { message: { id: 1, conversation_id: 'test', user_id: 'user1', content: 'multi-test', timestamp: '2024-01-01', type_: 'text' as const } };
    mockEventService.emit(eventName, testPayload);
    
    // 验证两个监听器都被调用
    expect(listener1).toHaveBeenCalledWith(testPayload);
    expect(listener2).toHaveBeenCalledWith(testPayload);
    
    // 清理
    unlisten1();
    unlisten2();
  });

  it('should invoke commands and return mock data', async () => {
    // 测试获取用户信息
    const userInfo = await mockEventService.invoke('get_user_info');
    expect(userInfo).toEqual({
      user_id: 'mock-user-1',
      username: 'Mock User',
      avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg'
    });
    
    // 测试获取会话列表
    const conversations = await mockEventService.invoke('get_conversations');
    expect(conversations).toEqual([
      {
        id: 'conv-1',
        name: 'Mock Conversation 1',
        last_message: 'Hello from mock!',
        timestamp: expect.any(Number)
      }
    ]);
    
    // 测试默认命令
    const defaultResult = await mockEventService.invoke('unknown_command');
    expect(defaultResult).toEqual({ success: true, message: 'Mock command executed' });
  });

  it('should log events and commands', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // 触发事件
    mockEventService.emit('test-event', { message: { id: 1, conversation_id: 'test', user_id: 'user1', content: 'test', timestamp: '2024-01-01', type_: 'text' as const } });
    expect(consoleSpy).toHaveBeenCalledWith('[Mock] 触发事件 test-event:', { message: { id: 1, conversation_id: 'test', user_id: 'user1', content: 'test', timestamp: '2024-01-01', type_: 'text' } });
    
    // 调用命令
    await mockEventService.invoke('test-command', { arg: 'value' });
    expect(consoleSpy).toHaveBeenCalledWith('[Mock] 调用命令 test-command:', { arg: 'value' });
    
    consoleSpy.mockRestore();
  });

  it('should get event service instance', () => {
    const service1 = getEventService();
    const service2 = getEventService();
    
    // 应该返回同一个实例（单例模式）
    expect(service1).toBe(service2);
    
    // 重置后应该返回新实例
    resetEventService();
    const service3 = getEventService();
    expect(service3).not.toBe(service1);
  });

  it('should force mock service when requested', () => {
    const mockService = getEventService(true);
    expect(mockService).toBe(mockEventService);
  });

  it('should create generic event service', () => {
    interface TestMessage {
      id: string;
      content: string;
    }

    const genericService = createEventService<TestMessage>();
    
    // 验证服务具有正确的类型
    expect(genericService.listen).toBeDefined();
    expect(genericService.emit).toBeDefined();
    expect(genericService.invoke).toBeDefined();
  });

  it('should support typed invoke with generics', async () => {
    interface UserInfo {
      id: string;
      name: string;
      email: string;
    }

    const service = createEventService<any>();
    const userInfo = await service.invoke<UserInfo>('get_user_info');
    
    // 验证返回类型
    expect(userInfo).toHaveProperty('user_id');
    expect(userInfo).toHaveProperty('username');
  });
}); 