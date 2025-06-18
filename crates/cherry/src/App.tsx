// src/App.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import StatusBar from './components/StatusBar';
import SettingsPage from './components/settings/SettingsPage';
import ContactPage from './components/ContactPage';
import { Conversation, Message, User } from './types/types';
import { useWindowSize } from './hooks/useWindowsSize.ts';

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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
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

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(134, 239, 172, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(134, 239, 172, 0.2);
  color: rgba(34, 197, 94, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(134, 239, 172, 0.2);
    transform: scale(1.1);
    color: rgb(34, 197, 94);
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
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

  const currentUser: User = {
    id: 'user1',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'online'
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
      <StatusBar currentUser={currentUser} />

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
