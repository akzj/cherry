import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockTauriService } from '../mockImpl';

describe('Mock Tauri Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should listen to events and call listeners', async () => {
    const mockListener = vi.fn();
    const eventName = 'test-event';
    
    // 监听事件
    const unlisten = await mockTauriService.listen(eventName, mockListener);
    
    // 触发事件
    const testPayload = { message: 'test' };
    mockTauriService.emit(eventName, testPayload);
    
    // 验证监听器被调用
    expect(mockListener).toHaveBeenCalledWith({ payload: testPayload });
    
    // 取消监听
    unlisten();
    
    // 再次触发事件，监听器不应该被调用
    mockTauriService.emit(eventName, { message: 'ignored' });
    expect(mockListener).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple listeners for the same event', async () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const eventName = 'multi-event';
    
    // 添加两个监听器
    const unlisten1 = await mockTauriService.listen(eventName, listener1);
    const unlisten2 = await mockTauriService.listen(eventName, listener2);
    
    // 触发事件
    const testPayload = { message: 'multi-test' };
    mockTauriService.emit(eventName, testPayload);
    
    // 验证两个监听器都被调用
    expect(listener1).toHaveBeenCalledWith({ payload: testPayload });
    expect(listener2).toHaveBeenCalledWith({ payload: testPayload });
    
    // 清理
    unlisten1();
    unlisten2();
  });

  it('should invoke commands and return mock data', async () => {
    // 测试获取用户信息
    const userInfo = await mockTauriService.invoke('get_user_info');
    expect(userInfo).toEqual({
      user_id: 'mock-user-1',
      username: 'Mock User',
      avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg'
    });
    
    // 测试获取会话列表
    const conversations = await mockTauriService.invoke('get_conversations');
    expect(conversations).toEqual([
      {
        id: 'conv-1',
        name: 'Mock Conversation 1',
        last_message: 'Hello from mock!',
        timestamp: expect.any(Number)
      }
    ]);
    
    // 测试默认命令
    const defaultResult = await mockTauriService.invoke('unknown_command');
    expect(defaultResult).toEqual({ success: true, message: 'Mock command executed' });
  });

  it('should log events and commands', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // 触发事件
    mockTauriService.emit('test-event', { data: 'test' });
    expect(consoleSpy).toHaveBeenCalledWith('[Mock Tauri] 触发事件 test-event:', { data: 'test' });
    
    // 调用命令
    await mockTauriService.invoke('test-command', { arg: 'value' });
    expect(consoleSpy).toHaveBeenCalledWith('[Mock Tauri] 调用命令 test-command:', { arg: 'value' });
    
    consoleSpy.mockRestore();
  });
}); 