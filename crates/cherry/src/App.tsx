// src/App.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import WindowControls from './components/WindowControls';
import SettingsPage from './components/settings/SettingsPage';
import ContactPage from './components/ContactPage';
import LoginForm from './pages/login';
import { Conversation, Message, User } from './types/types';
import { useWindowSize } from './hooks/useWindowsSize.ts';
import { useAuth } from './store/auth';

// ==================== Styled Components ====================
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg,rgba(134, 239, 172, 0.1) 0%,rgba(147, 197, 253, 0.05) 100%);
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
    border-color: rgba(134, 239, 172, 0.3) !important;
  }

  /* 移除链接的默认焦点样式 */
  a:focus {
    outline: none !important;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
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
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
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

const StatusIndicator = styled.div<{ status: string }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: ${({ status }) => {
    const colors: Record<string, string> = {
      online: 'linear-gradient(135deg, #10b981, #059669)',
      offline: 'linear-gradient(135deg, #6b7280, #4b5563)',
      away: 'linear-gradient(135deg, #f59e0b, #d97706)',
      dnd: 'linear-gradient(135deg, #ef4444, #dc2626)',
      busy: 'linear-gradient(135deg, #ef4444, #dc2626)',
    };
    return colors[status] || colors.offline;
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

const UserStatus = styled.p<{ status: string }>`
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
    background: ${({ status }) => {
    const colors: Record<string, string> = {
      online: 'linear-gradient(135deg, #10b981, #059669)',
      offline: 'linear-gradient(135deg, #6b7280, #4b5563)',
      away: 'linear-gradient(135deg, #f59e0b, #d97706)',
      dnd: 'linear-gradient(135deg, #ef4444, #dc2626)',
      busy: 'linear-gradient(135deg, #ef4444, #dc2626)',
    };
    return colors[status] || colors.offline;
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
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin: 16px;
  margin-left: 8px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(134, 239, 172, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: rgba(134, 239, 172, 0.3);
  }
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
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  // 模态窗口状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // 认证状态
  const { isLoggedIn, user, isLoading } = useAuth();

  // 如果正在加载认证状态，显示加载界面
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        Loading...
      </LoadingContainer>
    );
  }

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    return <LoginForm />;
  }

  // 登录成功后的主应用界面
  const currentUser: User = {
    id: user?.user_id || 'user1',
    name: user?.username || 'User',
    avatar: user?.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg',
    status: (user?.status as 'online' | 'offline' | 'away') || 'online'
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg${messages.length + 1}`,
      userId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: 'sent'
    };

    setMessages([...messages, newMessage]);

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    // Simulate message read
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 3000);
  };

  const selectedConvo = conversations.find(c => c.id === selectedConversation) || conversations[0];

  return (
    <AppContainer>
      <TitleBar>
        <LeftSection>
          <AvatarContainer>
            <AvatarWrapper>
              <Avatar src={currentUser.avatar} alt={currentUser.name} />
              <StatusIndicator status={currentUser.status} />
            </AvatarWrapper>
            <UserInfo>
              <UserName>{currentUser.name}</UserName>
              <UserStatus status={currentUser.status}>{currentUser.status}</UserStatus>
            </UserInfo>
          </AvatarContainer>
        </LeftSection>

        <CenterSection>
          <TitleText>Cherry Chat</TitleText>
        </CenterSection>

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

        {(selectedConversation || !isMobile) && (
          <ChatArea>
            <ChatHeader conversation={selectedConvo} />
            <MessageList
              messages={messages}
              currentUser={currentUser}
            />
            <MessageInput onSend={handleSendMessage} />
          </ChatArea>
        )}
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
            <ContactPage />
          </ContactModalContainer>
        </ModalOverlay>
      )}
    </AppContainer>
  );
};

// Mock data
const mockUsers: User[] = [
  {
    id: 'user2',
    name: 'Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    status: 'online'
  },
  {
    id: 'user3',
    name: 'Alex Johnson',
    avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
    status: 'away'
  },
  {
    id: 'user4',
    name: 'Sarah Williams',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    status: 'offline'
  }
];


const mockMessages: Message[] = [
  {
    id: 'msg1',
    userId: 'user2',
    content: 'Hey, how are you doing?',
    timestamp: '2023-05-15T10:30:00Z'
  },
  {
    id: 'msg2',
    userId: 'user1',
    content: "I'm good, thanks! How about you?",
    timestamp: '2023-05-15T10:32:00Z',
    isOwn: true,
    status: 'read'
  },
  {
    id: 'msg3',
    userId: 'user2',
    content: "I'm doing great! Just finished that project we were talking about.",
    timestamp: '2023-05-15T10:33:00Z'
  },
  {
    id: 'msg4',
    userId: 'user1',
    content: "That's awesome! Can you share some screenshots?",
    timestamp: '2023-05-15T10:35:00Z',
    isOwn: true,
    status: 'read'
  },
  {
    id: 'msg5',
    userId: 'user2',
    content: "Sure, I'll send them over shortly.",
    timestamp: '2023-05-15T10:36:00Z'
  },
  {
    id: 'msg6',
    userId: 'user1',
    content: "I'll send them over shortly.",
    timestamp: '2023-05-15T10:37:00Z',
    isOwn: true,
    status: 'read'
  },
  {
    id: 'msg7',
    userId: 'user2',
    content: "I'll send them over shortly.",
    timestamp: '2023-05-15T10:37:00Z',
  },
  {
    id: 'msg8',
    userId: 'user1',
    content: "I'll send them over shortly.",
    timestamp: '2023-05-15T10:37:00Z',
    isOwn: true,
    status: 'read'
  }
];


const mockConversations: Conversation[] = [
  {
    id: 'convo1',
    name: 'Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    participants: [mockUsers[0]],
    mentions: 0,
    type: 'direct',
    messages: mockMessages,
    lastMessage: {
      id: 'msg1',
      userId: 'user2',
      content: 'Hey, how are you doing?',
      timestamp: '2023-05-15T10:30:00Z'
    },
    unreadCount: 0
  },
  {
    id: 'convo2',
    name: 'Group Chat',
    avatar: 'https://cdn.dribbble.com/users/7179533/avatars/normal/f422e09d77e62217dc67c457f3cf1807.jpg',
    mentions: 1,
    type: 'group',
    messages: mockMessages,
    participants: mockUsers,
    lastMessage: {
      id: 'msg2',
      userId: 'user3',
      content: 'Meeting at 3pm tomorrow',
      timestamp: '2023-05-15T09:15:00Z'
    },
    unreadCount: 2
  },
  {
    id: 'convo3',
    name: 'Alex Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    participants: [mockUsers[1]],
    mentions: 0,
    type: 'direct',
    messages: mockMessages,
    lastMessage: {
      id: 'msg3',
      userId: 'user1',
      content: 'Thanks for the help!',
      timestamp: '2023-05-14T16:45:00Z'
    },
    unreadCount: 0
  }
];

export default App;
