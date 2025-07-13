// 抽象接口：定义组件需要的文件操作能力
export interface FileUploadCompleteResponse {
  file_url: string;
  file_thumbnail_url?: string;
  file_metadata?: any;
}

export interface FileInfo {
  name: string;
  size: number;
}

export interface FileService {
  uploadFile(conversationId: string, filePath: string): Promise<FileUploadCompleteResponse>;
  getCacheDirPath(): Promise<string>;
  exists(filePath: string): Promise<boolean>;
  downloadFile(url: string, cachePath: string): Promise<string>;
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