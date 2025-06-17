// src/App.tsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import StatusBar from './components/StatusBar';
import { Conversation, Message, User } from './types/types';
import { useWindowSize } from './hooks/useWindowsSize.ts';
import "./App.css";

const App: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  
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
        msg.id === newMessage.id ? {...msg, status: 'delivered'} : msg
      ));
    }, 1000);
    
    // Simulate message read
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? {...msg, status: 'read'} : msg
      ));
    }, 3000);
  };

  const selectedConvo = conversations.find(c => c.id === selectedConversation) || conversations[0];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-900 dark:text-gray-100">
      <StatusBar currentUser={currentUser} />
      
      <div className="flex flex-1 overflow-hidden">
        {(isMobile && !selectedConversation) || !isMobile ? (
          <Sidebar 
            conversations={conversations} 
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation} 
          />
        ) : null}
        
        {(selectedConversation || !isMobile) && (
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            <ChatHeader conversation={selectedConvo} />
            <MessageList 
              messages={messages} 
              currentUser={currentUser} 
            />
            <MessageInput onSend={handleSendMessage} />
          </div>
        )}
      </div>
    </div>
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
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    status: 'away'
  },
  {
    id: 'user4',
    name: 'Sarah Williams',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    status: 'offline'
  }
];

const mockConversations: Conversation[] = [
  {
    id: 'convo1',
    name: 'Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    participants: [mockUsers[0]],
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
    avatar: '',
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
    lastMessage: {
      id: 'msg3',
      userId: 'user1',
      content: 'Thanks for the help!',
      timestamp: '2023-05-14T16:45:00Z'
    },
    unreadCount: 0
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

export default App;
