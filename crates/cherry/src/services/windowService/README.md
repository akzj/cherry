# WindowService 服务说明

## 接口定义

见 `types.ts`：

```typescript
export interface WindowService {
  closeCurrentWindow: () => Promise<void>;
  minimizeCurrentWindow: () => Promise<void>;
}
```

## Mock 实现说明
- mockImpl.ts 提供本地窗口操作的模拟实现。
- 支持关闭、最小化窗口等mock能力。
- 便于前端开发和测试。

## Tauri 实现说明
- tauriImpl.ts 通过 Tauri invoke 调用后端命令。
- 命令包括：`cmd_window_close`、`cmd_window_minimize`。

## 用法示例

```typescript
import { getWindowService } from '@/services/windowService';

const windowService = getWindowService();

async function closeWindow() {
  await windowService.closeCurrentWindow();
}

async function minimizeWindow() {
  await windowService.minimizeCurrentWindow();
}
```

## 错误处理
- 所有方法均为 async，遇到错误时抛出异常。
- 建议业务层统一 try/catch 处理。

## mock/tauri 切换
- 通过 `isTauriEnv` 自动切换。
- 业务代码无需关心环境，直接用 `getWindowService()`。 