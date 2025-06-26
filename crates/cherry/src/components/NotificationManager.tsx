import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNotifications } from '../store/notification';
import NotificationToast from './NotificationToast';

const NotificationStack = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 8px;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const ConnectionStatus = styled.div<{ $isConnected: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ $isConnected }) =>
    $isConnected
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))'
      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))'};
  border: 1px solid ${({ $isConnected }) =>
    $isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  color: ${({ $isConnected }) => ($isConnected ? '#16a34a' : '#dc2626')};
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $isConnected }) => ($isConnected ? '#16a34a' : '#dc2626')};
    animation: ${({ $isConnected }) => ($isConnected ? 'pulse' : 'none')} 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const NotificationManager: React.FC = () => {
  const { notifications, isConnected } = useNotifications();
  const [activeNotifications, setActiveNotifications] = useState<Set<number>>(new Set());

  // 监听新通知
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      setActiveNotifications(prev => new Set([...prev, latestNotification.timestamp]));
    }
  }, [notifications]);

  // 移除通知
  const removeNotification = (timestamp: number) => {
    setActiveNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(timestamp);
      return newSet;
    });
  };

  // 获取当前活跃的通知
  const currentNotifications = notifications.filter(notification =>
    activeNotifications.has(notification.timestamp)
  );

  return (
    <>
      {/* <ConnectionStatus $isConnected={isConnected}>
        {isConnected ? '已连接' : '连接断开'}
      </ConnectionStatus> */}
      
      <NotificationStack>
        {currentNotifications.map((notification, index) => (
          <NotificationToast
            key={`${notification.timestamp}-${index}`}
            notification={notification}
            onClose={() => removeNotification(notification.timestamp)}
          />
        ))}
      </NotificationStack>
    </>
  );
};

export default NotificationManager; 