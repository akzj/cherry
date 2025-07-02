import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { NotificationType } from '../store/notification';

// 动画定义
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// 样式组件
const ToastContainer = styled.div<{ $isVisible: boolean; type: NotificationType }>`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  min-width: 240px;
  max-width: 320px;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${({ $isVisible }) => ($isVisible ? slideIn : slideOut)} 0.3s ease-in-out;
  transform: translateX(${({ $isVisible }) => ($isVisible ? '0' : '100%')});
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  
  background: ${({ type }) => {
    switch (type) {
      case 'contacts_updated':
        return 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))';
      case 'conversations_updated':
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))';
      case 'new_message':
        return 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.1))';
      case 'user_status_changed':
        return 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))';
      default:
        return 'linear-gradient(135deg, rgba(156, 163, 175, 0.1), rgba(107, 114, 128, 0.1))';
    }
  }};
  
  border-color: ${({ type }) => {
    switch (type) {
      case 'contacts_updated':
        return 'rgba(34, 197, 94, 0.3)';
      case 'conversations_updated':
        return 'rgba(59, 130, 246, 0.3)';
      case 'new_message':
        return 'rgba(168, 85, 247, 0.3)';
      case 'user_status_changed':
        return 'rgba(251, 191, 36, 0.3)';
      default:
        return 'rgba(156, 163, 175, 0.3)';
    }
  }};
`;

const ToastHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const ToastTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ToastIcon = styled.div<{ $type: NotificationType }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  
  background: ${({ $type }) => {
    switch ($type) {
      case 'contacts_updated':
        return 'linear-gradient(135deg, #22c55e, #16a34a)';
      case 'conversations_updated':
        return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'new_message':
        return 'linear-gradient(135deg, #a855f7, #9333ea)';
      case 'user_status_changed':
        return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
      default:
        return 'linear-gradient(135deg, #9ca3af, #6b7280)';
    }
  }};
  color: white;
`;

const ToastMessage = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(156, 163, 175, 0.1);
    color: #6b7280;
  }
`;

const ProgressBar = styled.div.attrs<{ $progress: number }>(({ $progress }) => ({
  style: { width: `${$progress}%` }
})) <{ $progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 0 0 12px 12px;
  transition: width 0.1s linear;
`;

// 通知类型配置
const notificationConfig = {
  contacts_updated: {
    title: '联系人更新',
    icon: '👥',
    defaultMessage: '联系人列表已更新',
  },
  conversations_updated: {
    title: '会话更新',
    icon: '💬',
    defaultMessage: '会话列表已更新',
  },
  new_message: {
    title: '新消息',
    icon: '📨',
    defaultMessage: '收到新消息',
  },
  user_status_changed: {
    title: '状态变更',
    icon: '🔄',
    defaultMessage: '用户状态已变更',
  },
};

const MAX_CONTENT_LENGTH = 40;
function getShortContent(content: string) {
  if (!content) return '';
  return content.length > MAX_CONTENT_LENGTH
    ? content.slice(0, MAX_CONTENT_LENGTH) + '...'
    : content;
}

interface NotificationToastProps {
  notification: {
    type: NotificationType;
    data?: any;
    timestamp: number;
  };
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = notificationConfig[notification.type];

  useEffect(() => {
    // 显示动画
    setIsVisible(true);

    const duration = 5000; // 5秒
    const startTime = notification.timestamp;
    const interval = 100; // 每100ms更新一次进度条

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;

      setProgress(newProgress);

      if (remaining <= 0) {
        setIsVisible(false);
        setTimeout(onClose, 300); // 等待动画完成
        return;
      }
    };

    // 立即更新一次进度
    updateProgress();

    const timer = setInterval(updateProgress, interval);

    return () => clearInterval(timer);
  }, [notification.timestamp, onClose]);

  const getMessage = () => {
    // 如果是对象，序列化为字符串
    if (notification.data?.message) {
      if (typeof notification.data.message === 'object') {
        return notification.data.message.content;
      }
      return notification.data.message;
    }

    switch (notification.type) {
      case 'contacts_updated':
        return `已更新 ${notification.data?.count || 0} 个联系人`;
      case 'conversations_updated':
        return `已更新 ${notification.data?.count || 0} 个会话`;
      case 'new_message':
        return notification.data?.sender ? `来自 ${notification.data.sender} 的新消息` : config.defaultMessage;
      default:
        return config.defaultMessage;
    }
  };

  return (
    <ToastContainer $isVisible={isVisible} type={notification.type}>
      <ToastHeader>
        <ToastTitle>
          <ToastIcon $type={notification.type}>{config.icon}</ToastIcon>
          {config.title}
        </ToastTitle>
        <CloseButton onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}>
          ✕
        </CloseButton>
      </ToastHeader>
      <ToastMessage>
        <span style={{
          display: 'block',
          maxWidth: '240px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {getShortContent(getMessage())}
        </span>
      </ToastMessage>
      <ProgressBar $progress={progress} />
    </ToastContainer>
  );
};

export default NotificationToast;   