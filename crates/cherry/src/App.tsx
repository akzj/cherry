import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ConversationContainer from './components/ConversationContainer';
import WindowControls from './components/WindowControls';
import SettingsPage from './components/settings/SettingsPage';
import NotificationManager from './components/NotificationManager';
import LoginForm from './components/login/login';
import { User } from '@/types';
import { useWindowSize } from './hooks/useWindowsSize.ts';
import { useAuth } from './store/auth';
import { useNotifications } from './store/notification';
import { useConversationStore } from './store/conversation';
import { useMessageReceiver } from './hooks/useMessageReceiver';
import { ErrorMessage } from './components/UI';
import { useAuthStore } from './store/auth';
import { getEventService } from './services/eventService';
import {
  AppContainer,
  LoadingSpinner,
  TitleBar,
  LeftSection,
  AvatarContainer,
  AvatarWrapper,
  Avatar,
  StatusIndicator,
  UserInfo,
  UserName,
  UserStatus,
  RightSection,
  ActionContainer,
  ActionButton,
  ActionIcon,
  MainContent,
  MainContentArea,
  ModalOverlay,
  SettingsModalContainer,
} from './App.styles';

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error || e.message, e);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason, e);
});




const App: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // 主导航状态
  const [activeMainNav, setActiveMainNav] = useState<'messages' | 'contacts'>('messages');

  // 模态窗口状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 认证状态
  const { isLoggedIn, user, isLoading: authLoading, initialize } = useAuth();

  // 强制重新渲染的状态
  const [forceUpdate, setForceUpdate] = useState(0);

  // 调试面板状态
  const [showVirtuaTest, setShowVirtuaTest] = useState(false);

  // 通知状态
  const { addNotification } = useNotifications();

  // 会话状态
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    refreshConversations
  } = useConversationStore();

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
    const eventService = getEventService();
    const unlisten = eventService.listen('notification', (message) => {
      const { event_type, data } = message as any;
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
      unlisten.then((f: () => void) => f());
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
    user_id: user?.user_id || 'user1',
    username: user?.username || 'Current User',
    email: user?.email || 'user@example.com',
    avatar_url: user?.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'online'
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
    // console.log('Showing login form - isLoggedIn:', isLoggedIn, 'forceUpdate:', forceUpdate);
    return <LoginForm />;
  }

  //console.log('Showing main app - user authenticated, forceUpdate:', forceUpdate);

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
              <Avatar src={currentUser.avatar_url} alt={currentUser.username} />
              <StatusIndicator $status={currentUser.status} />
            </AvatarWrapper>
            <UserInfo>
              <UserName>{currentUser.username}</UserName>
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

            <ActionButton onClick={() => setShowVirtuaTest(!showVirtuaTest)}>
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
            onSelectConversation={setSelectedConversation}
            onOpenSettings={() => setIsSettingsOpen(true)}
            activeMainNav={activeMainNav}
            setActiveMainNav={setActiveMainNav}
          />
        ) : null}
        
        {/* 主内容区域 */}
        <MainContentArea>
          {activeMainNav === 'messages' ? (
            !isMobile || selectedConversation ? (
              <ConversationContainer
                conversations={conversations}
                selectedConversationId={selectedConversation}
                currentUserId={currentUser.user_id}
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                fontSize: '18px',
                color: '#666'
              }}>
                选择一个对话开始聊天
              </div>
            )
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              fontSize: '18px',
              color: '#666'
            }}>
              选择一个联系人开始聊天
            </div>
          )}
        </MainContentArea>

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

      {/* Notification Manager */}
      <NotificationManager />
    </AppContainer>
  );
};

export default App;
