// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Conversation, User } from '../types/types';
import ContactList from './ContactList.tsx';

interface SidebarProps {
  conversations: Conversation[];
  currentUser: User;
  onSelectConversation: (id: string) => void;
}

type TabType = 'all' | 'unread' | 'mentions' | 'direct' | 'group';

const Sidebar: React.FC<SidebarProps> = ({ 
  conversations, 
  currentUser,
  onSelectConversation 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // 计算各类会话数量
  const unreadCount = conversations.filter(c => c.unreadCount > 0).length;
  const mentionCount = conversations.filter(c => c.mentions > 0).length;
  const directCount = conversations.filter(c => c.type === 'direct').length;
  const groupCount = conversations.filter(c => c.type === 'group').length;
  
  // 根据当前标签过滤会话
  const filteredConversations = conversations.filter(convo => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return convo.unreadCount > 0;
    if (activeTab === 'mentions') return convo.mentions > 0;
    if (activeTab === 'direct') return convo.type === 'direct';
    if (activeTab === 'group') return convo.type === 'group';
    return true;
  });

  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col h-full border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Messenger</h1>
          <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-700 focus:bg-gray-600 focus:outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* 分类导航栏 */}
        <div className="flex border-b border-gray-700 -mx-4 px-4">
          <button 
            className={`py-2 px-3 flex items-center space-x-1 text-sm font-medium relative ${activeTab === 'all' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('all')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>会话</span>
            {conversations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-600 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {conversations.length}
              </span>
            )}
          </button>
          
          <button 
            className={`py-2 px-3 flex items-center space-x-1 text-sm font-medium relative ${activeTab === 'unread' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('unread')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>未读</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          <button 
            className={`py-2 px-3 flex items-center space-x-1 text-sm font-medium relative ${activeTab === 'mentions' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('mentions')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>@我</span>
            {mentionCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {mentionCount}
              </span>
            )}
          </button>
          
          <button 
            className={`py-2 px-3 flex items-center space-x-1 text-sm font-medium ${activeTab === 'direct' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('direct')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
            <span>单聊</span>
          </button>
          
          <button 
            className={`py-2 px-3 flex items-center space-x-1 text-sm font-medium ${activeTab === 'group' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('group')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span>群聊</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <ContactList 
            conversations={filteredConversations} 
            onSelectConversation={onSelectConversation}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-gray-700 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-lg">没有{getTabLabel(activeTab)}消息</p>
            <p className="text-sm mt-2 text-center px-8">开始新的对话或查看其他分类</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full"
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${currentUser.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          </div>
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-xs text-gray-400">在线</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 获取标签名称
const getTabLabel = (tab: TabType): string => {
  switch (tab) {
    case 'all': return '';
    case 'unread': return '未读';
    case 'mentions': return '@我';
    case 'direct': return '单聊';
    case 'group': return '群聊';
    default: return '';
  }
};

export default Sidebar;
