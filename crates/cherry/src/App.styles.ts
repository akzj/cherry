import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(134, 239, 172, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(167, 243, 208, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  /* 全局滚动条样式 */
  *::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  /* 移除默认焦点样式 */
  *:focus {
    outline: none !important;
  }

  /* 移除按钮和输入框的默认边框 */
  button:focus,
  input:focus,
  select:focus,
  textarea:focus {
    outline: none !important;
  }

  /* 移除链接的默认焦点样式 */
  a:focus {
    outline: none !important;
  }
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const TitleBar = styled.div`
  height: 64px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(134, 239, 172, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  -webkit-app-region: drag;
  user-select: none;
  position: relative;
  z-index: 1000;
  box-shadow: 0 1px 2px -1px rgba(100, 156, 105, 0.1), 0 2px 4px -1px rgba(144, 182, 196, 0.06);
  
  /* 确保按钮不可拖拽 */
  button, input, select, textarea {
    -webkit-app-region: no-drag;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  -webkit-app-region: no-drag;
`;

export const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
`;

export const AvatarWrapper = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
`;

export const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(134, 239, 172, 0.3);
  }
`;

export const StatusIndicator = styled.div<{ $status: string }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: ${({ $status }) => {
    const colors: Record<string, string> = {
      online: 'linear-gradient(135deg, #10b981, #059669)',
      offline: 'linear-gradient(135deg, #6b7280, #4b5563)',
      away: 'linear-gradient(135deg, #f59e0b, #d97706)',
      dnd: 'linear-gradient(135deg, #ef4444, #dc2626)',
      busy: 'linear-gradient(135deg, #ef4444, #dc2626)',
    };
    return colors[$status] || colors.offline;
  }};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

export const UserName = styled.p`
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0;
  letter-spacing: 0.025em;
  color: #1f2937;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const UserStatus = styled.p<{ $status: string }>`
  font-size: 0.75rem;
  text-transform: capitalize;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-weight: 500;
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $status }) => {
    const colors: Record<string, string> = {
      online: 'linear-gradient(135deg, #10b981, #059669)',
      offline: 'linear-gradient(135deg, #6b7280, #4b5563)',
      away: 'linear-gradient(135deg, #f59e0b, #d97706)',
      dnd: 'linear-gradient(135deg, #ef4444, #dc2626)',
      busy: 'linear-gradient(135deg, #ef4444, #dc2626)',
    };
    return colors[$status] || colors.offline;
  }};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  -webkit-app-region: no-drag;
`;

export const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-right: 0.5rem;
`;

export const ActionButton = styled.button`
  background: linear-gradient(135deg, rgba(134, 239, 172, 0.1), rgba(147, 197, 253, 0.1));
  border: 1px solid rgba(134, 239, 172, 0.2);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: linear-gradient(135deg, rgba(134, 239, 172, 0.2), rgba(147, 197, 253, 0.2));
    transform: translateY(-1px) scale(1.05);
    box-shadow: 0 4px 12px rgba(134, 239, 172, 0.3);
    
    svg {
      transform: scale(1.1);
      fill: #22c55e;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  &.has-notification::after {
    opacity: 1;
  }
`;

export const ActionIcon = styled.svg`
  width: 16px;
  height: 16px;
  fill: #6b7280;
  transition: all 0.3s ease;
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

export const MainContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

// 模态窗口样式
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const SettingsModalContainer = styled.div`
  width: 90vw;
  height: 90vh;
  max-width: 800px;
  max-height: 600px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(134, 239, 172, 0.2);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

export const ContactModalContainer = styled.div`
  width: 90vw;
  height: 90vh;
  max-width: 1000px;
  max-height: 1000px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(134, 239, 172, 0.2);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`; 