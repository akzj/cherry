import { ListenerService } from './types';

/**
 * Mock 事件监听服务
 * 模拟后端主动向前端推送事件的行为
 * 支持手动触发事件和自动定时推送事件
 */
export class MockListenerService implements ListenerService {
  // 存储事件回调：key 是事件名称，value 是回调函数数组
  private eventCallbacks = new Map<string, Array<(...args: any[]) => void>>();

  // 存储自动推送事件的定时器
  private autoEventTimers = new Map<string, NodeJS.Timeout>();

  constructor() {
    // 初始化时启动一些自动推送的模拟事件（模拟真实后端行为）
    this.startAutoEvents();
  }

  /**
   * 订阅事件
   */
  on(eventName: string, callback: (...args: any[]) => void): () => void {
    if (!this.eventCallbacks.has(eventName)) {
      this.eventCallbacks.set(eventName, []);
    }
    this.eventCallbacks.get(eventName)!.push(callback);

    // 返回取消订阅的函数
    return () => {
      this.off(eventName, callback);
    };
  }

  /**
   * 取消订阅事件
   */
  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!this.eventCallbacks.has(eventName)) return;

    const callbacks = this.eventCallbacks.get(eventName)!;
    if (callback) {
      // 移除特定回调
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    } else {
      // 移除所有回调
      callbacks.length = 0;
    }

    // 如果事件没有回调了，停止对应的自动推送
    if (callbacks.length === 0) {
      this.stopAutoEvent(eventName);
    }
  }

  /**
   * 手动触发事件（测试用）
   */
  trigger(eventName: string, ...data: any[]): void {
    if (!this.eventCallbacks.has(eventName)) return;

    // 触发所有订阅该事件的回调
    const callbacks = [...this.eventCallbacks.get(eventName)!]; // 复制一份避免执行中修改
    callbacks.forEach(callback => {
      try {
        callback(...data);
      } catch (error) {
        console.error(`[MockListener] 事件 ${eventName} 回调执行出错:`, error);
      }
    });
  }

  /**
   * 启动自动推送的模拟事件
   * 模拟后端定期推送的事件（如系统状态、实时数据等）
   */
  private startAutoEvents() {
    // 1. 系统状态事件（每 8 秒推送一次）
    this.autoEventTimers.set('system-status', setInterval(() => {
      this.trigger('system-status', {
        cpu: Math.floor(Math.random() * 80) + 10, // 10%-90%
        memory: Math.floor(Math.random() * 70) + 20, // 20%-90%
        timestamp: Date.now(),
        status: Math.random() > 0.1 ? 'normal' : 'warning' // 10% 概率警告状态
      });
    }, 8000));

    // 2. 消息通知事件（随机 10-20 秒推送一次）
    const pushNotification = () => {
      const notifications = [
        { id: Date.now(), title: '新消息', content: '您有一条未读消息', type: 'message' },
        { id: Date.now() + 1, title: '系统提示', content: '应用将在 5 分钟后更新', type: 'system' },
        { id: Date.now() + 2, title: '任务完成', content: '数据同步已完成', type: 'task' }
      ];
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      this.trigger('notification', randomNotification);

      // 随机设置下一次推送时间（10-20 秒）
      const nextDelay = 10000 + Math.random() * 10000;
      this.autoEventTimers.set('notification', setTimeout(pushNotification, nextDelay));
    };
    pushNotification();
  }

  /**
   * 停止特定事件的自动推送
   */
  private stopAutoEvent(eventName: string) {
    const timer = this.autoEventTimers.get(eventName);
    if (timer) {
      clearInterval(timer);
      this.autoEventTimers.delete(eventName);
    }
  }

  /**
   * 清理资源（用于组件卸载时）
   */
  cleanup() {
    // 清除所有定时器
    this.autoEventTimers.forEach(timer => clearInterval(timer));
    this.autoEventTimers.clear();
    this.eventCallbacks.clear();
  }
}
