// 抽象接口：定义组件需要的文件操作能力
export interface FileService {
    // 获取缓存目录路径
    getCacheDirPath: () => Promise<string>;
    // 检查文件是否存在
    exists: (filePath: string) => Promise<boolean>;
    // 下载文件到缓存目录
    downloadFile: (url: string, cachePath: string) => Promise<string>;
    // 转换文件路径为可访问的 URL（适配环境：Tauri 用自定义协议，浏览器用 HTTP）
    toAccessibleUrl: (filePath: string) => string;
  }