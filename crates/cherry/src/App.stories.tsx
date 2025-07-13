import type { Meta, StoryObj } from '@storybook/react';
import { vi } from 'vitest';
import App from './App';
import { mockEventService } from './services/eventService/mockImpl';

// Mock Event服务
vi.mock('./services/eventService', () => ({
  getEventService: () => mockEventService,
}));

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    // 可以添加控制参数
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithMockNotifications: Story = {
  args: {},
  play: async () => {
    // 模拟触发一些通知事件
    setTimeout(() => {
      mockEventService.emit('notification', {
        event_type: 'new_message',
        data: { message: 'Hello from Storybook!' }
      } as any);
    }, 1000);
    
    setTimeout(() => {
      mockEventService.emit('notification', {
        event_type: 'contacts_updated',
        data: { count: 5 }
      } as any);
    }, 2000);
  },
};

export const LoadingState: Story = {
  args: {},
  parameters: {
    // 可以模拟加载状态
  },
}; 