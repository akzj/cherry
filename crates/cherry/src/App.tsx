// src/App.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { listen } from '@tauri-apps/api/event';
import Sidebar from './components/Sidebar';
import ConversationContainer from './components/ConversationContainer';
import WindowControls from './components/WindowControls';
import SettingsPage from './components/settings/SettingsPage';
import ContactPage from './components/ContactPage';
import NotificationManager from './components/NotificationManager';
// import MessageTest from './components/MessageTest';
import LoginForm from './pages/login';
import { User } from './types/types';
import { useWindowSize } from './hooks/useWindowsSize.ts';
import { useAuth } from './store/auth';
import { useNotifications } from './store/notification';
import { useConversationStore } from './store/conversation';
import { useMessageStore } from './store/message';
import { useMessageReceiver } from './hooks/useMessageReceiver';
import { ErrorMessage } from './components/UI';
import { useAuthStore } from './store/auth';
// import DebugPanel from './components/DebugPanel';
// import MessageDebug from './components/MessageDebug';
//import ScrollTest from './components/ScrollTest';

// ==================== Styled Components ====================
const AppContainer = styled.div`
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
  * {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

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

const LoadingSpinner = styled.div`
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

const TitleBar = styled.div`
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

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  -webkit-app-region: no-drag;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
`;

const Avatar = styled.img`
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

const StatusIndicator = styled.div<{ $status: string }>`
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

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const UserName = styled.p`
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

const UserStatus = styled.p<{ $status: string }>`
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

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  -webkit-app-region: drag;
`;

const TitleText = styled.div`
  color: rgba(34, 197, 94, 0.8);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  -webkit-app-region: no-drag;
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-right: 0.5rem;
`;

const ActionButton = styled.button`
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

const ActionIcon = styled.svg`
  width: 16px;
  height: 16px;
  fill: #6b7280;
  transition: all 0.3s ease;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;



// 模态窗口样式
const ModalOverlay = styled.div`
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

const SettingsModalContainer = styled.div`
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

const ContactModalContainer = styled.div`
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

const App: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);

  // 模态窗口状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 认证状态
  const { isLoggedIn, user, isLoading: authLoading, initialize } = useAuth();

  // 强制重新渲染的状态
  const [forceUpdate, setForceUpdate] = useState(0);

  // 调试面板状态
  const [isDebugVisible, setIsDebugVisible] = useState(false);

  // 通知状态
  const { addNotification } = useNotifications();

  // 会话状态
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    refreshConversations,
    getConversationById
  } = useConversationStore();

  // 消息状态
  const { getMessages, sendMessage } = useMessageStore();

  // 消息接收
  useMessageReceiver();

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      await initialize();
    };
    initAuth();
  }, [initialize]);

  // 监听认证状态变化
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(
      (state) => {
        console.log('Auth state changed, isAuthenticated:', state.isAuthenticated);
        setForceUpdate(prev => prev + 1);
      }
    );

    return unsubscribe;
  }, []);

  // 添加调试信息
  useEffect(() => {
    console.log('Auth state:', { isLoggedIn, isLoading: authLoading, user });
  }, [isLoggedIn, authLoading, user]);

  // 监听通知事件
  useEffect(() => {
    const unlisten = listen('notification', (event) => {
      const { event_type, data } = event.payload as any;
      console.log('Received notification:', event_type, data);

      switch (event_type) {
        case 'contacts_updated':
          addNotification({
            type: 'contacts_updated',
            data: { count: data.count },
            timestamp: Date.now(),
          });
          break;
        case 'conversations_updated':
          addNotification({
            type: 'conversations_updated',
            data: { count: data.count },
            timestamp: Date.now(),
          });
          // 刷新会话列表
          refreshConversations();
          break;
        case 'new_message':
          addNotification({
            type: 'new_message',
            data: { message: data.message },
            timestamp: Date.now(),
          });
          break;
        case 'user_status_changed':
          addNotification({
            type: 'user_status_changed',
            data: { user: data.user, status: data.status },
            timestamp: Date.now(),
          });
          break;
      }
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [addNotification, refreshConversations]);

  // 登录成功后加载数据
  useEffect(() => {
    if (isLoggedIn && user) {
      console.log('User logged in, loading data...');
      refreshConversations();
    }
  }, [isLoggedIn, user, refreshConversations]);

  // 当前用户信息
  const currentUser: User = {
    id: user?.user_id || 'user1',
    name: user?.username || 'Current User',
    avatar: user?.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'online'
  };

  // 处理会话选择
  const handleSelectConversation = (id: string) => {
    setIsContactModalOpen(false);
    setPendingConversationId(id);
  };

  // 监听弹窗关闭后再切换会话，避免页面闪烁
  useEffect(() => {
    if (!isContactModalOpen && pendingConversationId) {
      setSelectedConversation(pendingConversationId);
      setPendingConversationId(null);
    }
  }, [isContactModalOpen, pendingConversationId]);

  // 处理发送消息 - 接收会话ID作为参数
  const handleSendMessage = async (conversationId: string, content: string, replyTo?: number) => {
    try {
      await sendMessage(conversationId, content, 'text', replyTo);
      console.log(`Message sent to conversation ${conversationId}: ${content}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      // 可以在这里添加错误提示
    }
  };

  // 如果正在加载认证状态，显示加载界面
  if (authLoading) {
    console.log('Showing loading screen - authLoading:', authLoading, 'forceUpdate:', forceUpdate);
    return (
      <AppContainer>
        <LoadingSpinner />
      </AppContainer>
    );
  }

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    console.log('Showing login form - isLoggedIn:', isLoggedIn, 'forceUpdate:', forceUpdate);
    return <LoginForm />;
  }

  console.log('Showing main app - user authenticated, forceUpdate:', forceUpdate);

  // 如果正在加载会话数据，显示加载界面
  if (conversationsLoading) {
    return (
      <AppContainer>
        <LoadingSpinner />
      </AppContainer>
    );
  }

  // 如果加载会话数据出错，显示错误界面
  if (conversationsError) {
    return (
      <AppContainer>
        <ErrorMessage
          message={conversationsError}
          onRetry={refreshConversations}
        />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <TitleBar>
        <LeftSection>
          <AvatarContainer>
            <AvatarWrapper>
              <Avatar src={currentUser.avatar} alt={currentUser.name} />
              <StatusIndicator $status={currentUser.status} />
            </AvatarWrapper>
            <UserInfo>
              <UserName>{currentUser.name}</UserName>
              <UserStatus $status={currentUser.status}>{currentUser.status}</UserStatus>
            </UserInfo>
          </AvatarContainer>
        </LeftSection>



        <RightSection>
          <ActionContainer>
            <ActionButton className="has-notification">
              <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </ActionIcon>
            </ActionButton>

            <ActionButton>
              <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </ActionIcon>
            </ActionButton>

            <ActionButton>
              <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </ActionIcon>
            </ActionButton>
          </ActionContainer>
          <WindowControls />
        </RightSection>
      </TitleBar>

      <MainContent>
        {(isMobile && !selectedConversation) || !isMobile ? (
          <Sidebar
            conversations={conversations}
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenContacts={() => setIsContactModalOpen(true)}
          />
        ) : null}

        <ConversationContainer
          conversations={conversations}
          selectedConversationId={selectedConversation}
          currentUserId={currentUser.id}
          onSendMessage={handleSendMessage}
        />

        {/* 临时添加消息测试组件 */}
        {/* <MessageTest /> */}
      </MainContent>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <ModalOverlay onClick={() => setIsSettingsOpen(false)}>
          <SettingsModalContainer onClick={(e) => e.stopPropagation()}>
            <SettingsPage />
          </SettingsModalContainer>
        </ModalOverlay>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && (
        <ModalOverlay onClick={() => setIsContactModalOpen(false)}>
          <ContactModalContainer onClick={(e) => e.stopPropagation()}>
            <ContactPage onSelectConversation={handleSelectConversation} />
          </ContactModalContainer>
        </ModalOverlay>
      )}

      {/* Notification Manager */}
      <NotificationManager />

      {/* Debug Panel */}
      {/* <DebugPanel 
        isVisible={isDebugVisible} 
        onToggle={() => setIsDebugVisible(!isDebugVisible)} 
      /> */}

      {/* Message Debug */}
      {/* <MessageDebug selectedConversation={selectedConversation} /> */}

      {/* Scroll Test */}
      {/* <ScrollTest /> */}
    </AppContainer>
  );
};

export default App;
