// src/components/AsyncMessageImage.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AsyncMessageImage from './AsyncMessageImage';

const meta: Meta<typeof AsyncMessageImage> = {
  title: 'Components/AsyncMessageImage',
  component: AsyncMessageImage,
  // 全局装饰器：确保 Storybook 中使用 mock 服务
  decorators: [
    (Story) => {
      // 重置 mock 缓存（可选：每次渲染故事时清空缓存）
      localStorage.setItem('mock-cached-files', '[]');
      return <Story />;
    },
  ],
  parameters: {
    // 可配置 mock 行为（如延迟、是否失败）
    mock: {
      delay: 1000, // 模拟加载延迟
      shouldFail: false, // 是否模拟失败
    },
  },
};

export default meta;
type Story = StoryObj<typeof AsyncMessageImage>;

// 场景 1：正常加载（使用 mock 的图片 URL）
export const Default: Story = {
  args: {
    url: 'https://picsum.photos/seed/story1/400/400', // 模拟原始图片 URL
  },
};

// 场景 2：模拟加载延迟（通过参数调整）
export const WithLongLoading: Story = {
  args: {
    url: 'https://picsum.photos/seed/story2/400/400',
  },
  parameters: {
    mock: { delay: 3000 }, // 延迟 3 秒
  },
};

// 场景 3：模拟加载失败
export const LoadFailed: Story = {
  args: {
    url: 'https://picsum.photos/seed/fail/400/400',
  },
  parameters: {
    mock: { shouldFail: true }, // 强制失败
  },
};

// 场景 4：模拟缓存命中（第二次加载同一 URL 时直接返回缓存）
export const FromCache: Story = {
  args: {
    url: 'https://picsum.photos/seed/cache/400/400',
  },
  play: async () => {
    // 先手动添加到 mock 缓存，模拟“已下载过”
    localStorage.setItem('mock-cached-files', JSON.stringify(['mock-cache-dir/cache']));
  },
};