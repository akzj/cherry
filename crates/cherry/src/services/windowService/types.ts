// 窗口服务接口：定义组件需要的窗口操作
export interface WindowService {
    closeCurrentWindow: () => Promise<void>; // 关闭当前窗口
    minimizeCurrentWindow: () => Promise<void>; // 最小化当前窗口（可选，扩展用）
  }

export class ServiceError extends Error {
  code: string;
  constructor(message: string, code = 'SERVICE_ERROR') {
    super(message);
    this.code = code;
  }
}