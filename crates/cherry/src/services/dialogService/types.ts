

export interface FileInfo {
  path: string;           // 文件路径
  name: string;           // 文件名
  size: number;           // 文件大小（字节）
  type: string;           // 文件MIME类型
  lastModified: number;   // 最后修改时间戳（毫秒）
  lastModifiedDate?: Date; // 最后修改日期对象
}

export interface DialogService {
  openImageDialog(): Promise<FileInfo | null>;
  openFileDialog(): Promise<FileInfo | null>;
}