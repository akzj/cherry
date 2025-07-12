// .storybook/preview.tsx
import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/index.css'; // 导入全局样式（如 Tailwind 入口）
import { setMockConfig } from '../src/services/fileService/mockImpl'; // 导入 mock 配置工具

// 添加 Tauri 类型声明
declare global {
  interface Window {
    __TAURI__?: any;
  }
}

// 全局装饰器：所有故事都会被这个组件包裹
const GlobalDecorator = (Story: any) => (
  <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
    <Story />
  </div>
);

const preview: Preview = {
  // 全局装饰器：数组中的装饰器会按顺序执行
  decorators: [
    GlobalDecorator, // 应用全局布局
    (Story, context) => {
      // 场景：根据故事参数动态配置 mock 服务（如延迟、是否失败）
      const mockParams = context.parameters.mock || {};
      setMockConfig(mockParams); // 应用 mock 配置

      // 场景：模拟 Tauri 环境变量（如果组件依赖 window.__TAURI__）
      if (typeof window !== 'undefined' && !window.__TAURI__) {
        window.__TAURI__ = {
          // 只模拟组件需要的 Tauri API（避免全量模拟）
          invoke: async (cmd: string) => {
            if (cmd === 'cmd_download_file') return 'mock-file-path';
            return null;
          },
        } as any;
      }

      return <Story />;
    },
  ],

  // 全局参数：所有故事共享的参数
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' }, // 自动检测事件处理函数
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // 全局 mock 配置（可被单个故事覆盖）
    mock: {
      delay: 500, // 默认模拟 500ms 延迟
      shouldFail: false, // 默认不模拟失败
    },
    // 视图port配置（模拟不同设备尺寸）
    viewport: {
      defaultViewport: 'mobile1',
      viewports: {
        mobile1: { name: 'Mobile', styles: { width: '320px', height: '568px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '720px' } },
      },
    },
    // 故事排序现在在 parameters 中
    storySort: {
      order: ['Introduction', 'Components', 'Features'],
    },
  },
};

export default preview;