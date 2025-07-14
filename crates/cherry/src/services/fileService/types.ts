// 抽象接口：定义组件需要的文件操作能力
export interface FileUploadCompleteResponse {
  url: string;
  image_metadata?: {
    thumbnail_url?: string;
    height?: number;
    width?: number;
    size?: number;
  };
}

export interface FileInfo {
  name: string;
  size: number;
}

export interface FileService {
  uploadFile(conversationId: string, filePath: string): Promise<FileUploadCompleteResponse>;
  downloadFile(url: string): Promise<string>;
  toAccessibleUrl(filePath: string): string;
  getFileInfo(filePath: string): Promise<FileInfo>;
}

export class ServiceError extends Error {
  code: string;
  constructor(message: string, code = 'SERVICE_ERROR') {
    super(message);
    this.code = code;
  }
}