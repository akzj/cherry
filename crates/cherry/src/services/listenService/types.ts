/**
 * 事件监听服务的抽象接口
 * 统一处理不同环境（Mock/Electron/Tauri）的事件订阅和推送
 */
export interface ListenerService {
  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param callback 事件回调函数
   * @returns 取消订阅的函数
   */
  on: (eventName: string, callback: (...args: any[]) => void) => () => void;

  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param callback 要取消的回调函数（可选，不填则取消所有该事件的订阅）
   */
  off: (eventName: string, callback?: (...args: any[]) => void) => void;

  /**
   * （仅 Mock 环境）手动触发事件（用于测试）
   * @param eventName 事件名称
   * @param data 事件数据
   */
  trigger?: (eventName: string, ...data: any[]) => void;
}
