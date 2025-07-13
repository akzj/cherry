# FileService 服务说明

## 接口定义

见 `types.ts`：

```typescript
export interface FileService {
  uploadFile(conversationId: string, filePath: string): Promise<FileUploadCompleteResponse>;
  getCacheDirPath(): Promise<string>;
  exists(filePath: string): Promise<boolean>;
  downloadFile(url: string, cachePath: string): Promise<string>;
  toAccessibleUrl(filePath: string): string;
  getFileInfo(filePath: string): Promise<FileInfo>;
}
```

## Mock 实现说明
- mockImpl.ts 提供本地文件操作的模拟实现。
- 支持文件上传、下载、存在性检查等mock能力。
- 便于前端开发和测试。

## Tauri 实现说明
- tauriImpl.ts 通过 Tauri invoke 调用后端命令。
- 命令包括：`cmd_file_upload`、`cmd_file_exists`、`cmd_file_download`、`cmd_file_info`。

## 用法示例

```typescript
import { fileService } from '@/services/fileService';

async function uploadFile(conversationId: string, filePath: string) {
  const result = await fileService.uploadFile(conversationId, filePath);
  console.log(result.file_url);
}

async function checkFile(filePath: string) {
  const exists = await fileService.exists(filePath);
  console.log(exists);
}
```

## 错误处理
- 所有方法均为 async，遇到错误时抛出异常。
- 建议业务层统一 try/catch 处理。

## mock/tauri 切换
- 通过 `isTauriEnv` 自动切换。
- 业务代码无需关心环境，直接用 `fileService`。 