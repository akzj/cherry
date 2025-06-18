// src/components/Sidebar.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Conversation, User } from '../types/types';
import ContactList from './ContactList.tsx';
import SettingsPage from './settings/SettingsPage';

interface SidebarProps {
    conversations: Conversation[];
    currentUser: User;
    onSelectConversation: (id: string) => void;
}

type TabType = 'all' | 'unread' | 'mentions' | 'direct' | 'group';

// ==================== Styled Components ====================
const SidebarContainer = styled.div`
  width: 320px;
  background-color: rgba(31, 41, 55, 0.75);
  backdrop-filter: blur(12px);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(55, 65, 81, 0.5);
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const IconButton = styled.button`
  padding: 0.5rem;
  border-radius: 9999px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(55, 65, 81, 0.5);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2.5rem;
  border-radius: 0.5rem;
  background-color: rgba(55, 65, 81, 0.5);
  transition: background-color 0.2s;
  color: white;
  
  &:focus {
    background-color: rgba(75, 85, 99, 0.5);
    outline: none;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(156, 163, 175);
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const VerticalNav = styled.div`
  width: 4rem;
  background-color: rgba(17, 24, 39);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(55, 65, 81, 0.5);
`;

const NavButton = styled.button<{ $active?: boolean }>`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background-color 0.2s;
  background-color: ${props => props.$active ? 'rgba(31, 41, 55)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.$active ? 'rgba(31, 41, 55)' : 'rgba(31, 41, 55, 0.5)'};
  }
`;

const NavIconWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Badge = styled.span<{ $color?: string; $bgColor?: string }>`
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background-color: ${props => props.$bgColor || props.$color || '#3b82f6'};
  color: white;
  font-size: 0.65rem;
  border-radius: 9999px;
  height: 1rem;
  width: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavLabel = styled.span`
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const NavSpacer = styled.div`
  flex: 1;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
  padding-top: 0.5rem;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ContentHeader = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span<{ $color?: string, $bgColor?: string }>`
  margin-left: 0.5rem;
  background-color: ${props => props.$bgColor || '#3b82f6'};
  color: ${props => props.$color || 'white'};
  font-size: 0.75rem;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(156, 163, 175);
  padding: 1.5rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  background-color: rgba(55, 65, 81, 0.5);
  border-radius: 9999px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1rem;
  color: rgba(156, 163, 175);
`;

const ActionButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2563eb;
  }
`;

const SettingsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SettingsPanel = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  @media (prefers-color-scheme: dark) {
    background-color: rgba(31, 41, 55, 0.9);
  }
  backdrop-filter: blur(12px);
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 56rem;
  height: 90vh;
  position: relative;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
  
  &:hover {
    color: #4b5563;
    @media (prefers-color-scheme: dark) {
      color: #d1d5db;
    }
  }
`;

// ==================== Component Implementation ====================
const Sidebar: React.FC<SidebarProps> = ({
    conversations,
    currentUser,
    onSelectConversation
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        <>
            <SidebarContainer>
                <Header>
                    <HeaderActions>
                        <IconButton>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.333 6.667h.01M10 6.667h.01M14.667 6.667h.01M6.667 13.333H2.667a1.333 1.333 0 01-1.333-1.333V3.333a1.333 1.333 0 011.333-1.333h11.333a1.333 1.333 0 011.333 1.333v8a1.333 1.333 0 01-1.333 1.333h-4.667l-4.667 4.667v-4.667z" />
                            </svg>
                        </IconButton>

                        <IconButton onClick={() => setIsSettingsOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </IconButton>
                    </HeaderActions>

                    <SearchContainer>
                        <SearchInput
                            type="text"
                            placeholder="搜索联系人..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </SearchIcon>
                    </SearchContainer>
                </Header>

                {/* 垂直分类导航栏 */}
                <ContentContainer>
                    <VerticalNav>

                        <NavButton
                            $active={activeTab === 'mentions'}
                            onClick={() => setActiveTab('mentions')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'mentions' ? '#60a5fa' : '#9ca3af'}>
                                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {mentionCount > 0 && (
                                    <Badge $color="#f59e0b" $bgColor="#fef3c7">{mentionCount}</Badge>
                                )}
                                <NavLabel>@我</NavLabel>
                            </NavIconWrapper>
                        </NavButton>


                        <NavButton
                            $active={activeTab === 'unread'}
                            onClick={() => setActiveTab('unread')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'unread' ? '#60a5fa' : '#9ca3af'}>
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                                {unreadCount > 0 && (
                                    <Badge $color="#ef4444">{unreadCount}</Badge>
                                )}
                                <NavLabel>未读</NavLabel>
                            </NavIconWrapper>
                        </NavButton>


                        <NavButton
                            $active={activeTab === 'all'}
                            onClick={() => setActiveTab('all')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'all' ? '#60a5fa' : '#9ca3af'}>
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {conversations.length > 0 && (
                                    <Badge>{conversations.length}</Badge>
                                )}
                                <NavLabel>会话</NavLabel>
                            </NavIconWrapper>
                        </NavButton>




                        <NavButton
                            $active={activeTab === 'direct'}
                            onClick={() => setActiveTab('direct')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'direct' ? '#60a5fa' : '#9ca3af'}>
                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                </svg>
                                <NavLabel>单聊</NavLabel>
                            </NavIconWrapper>
                        </NavButton>

                        <NavButton
                            $active={activeTab === 'group'}
                            onClick={() => setActiveTab('group')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'group' ? '#60a5fa' : '#9ca3af'}>
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                <NavLabel>群聊</NavLabel>
                            </NavIconWrapper>
                        </NavButton>

                        <NavSpacer>
                            <NavButton>
                                <NavIconWrapper>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="#9ca3af">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                    <NavLabel>添加</NavLabel>
                                </NavIconWrapper>
                            </NavButton>
                        </NavSpacer>
                    </VerticalNav>

                    <MainContent>
                        <ContentHeader>
                            <Title>
                                {getTabLabel(activeTab)}
                                {activeTab === 'unread' && unreadCount > 0 && (
                                    <StatusBadge $bgColor="#ef4444">{unreadCount} 未读</StatusBadge>
                                )}
                                {activeTab === 'mentions' && mentionCount > 0 && (
                                    <StatusBadge $bgColor="#fef3c7" $color="#92400e">{mentionCount} 提及</StatusBadge>
                                )}
                            </Title>
                        </ContentHeader>

                        {filteredConversations.length > 0 ? (
                            <ContactList
                                conversations={filteredConversations}
                                onSelectConversation={onSelectConversation}
                            />
                        ) : (
                            <EmptyState>
                                <EmptyIcon>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </EmptyIcon>
                                <EmptyText>
                                    {activeTab === 'all' && '没有会话'}
                                    {activeTab === 'unread' && '没有未读消息'}
                                    {activeTab === 'mentions' && '没有提到您的消息'}
                                    {activeTab === 'direct' && '没有单聊会话'}
                                    {activeTab === 'group' && '没有群聊会话'}
                                </EmptyText>
                                <EmptySubtext>
                                    {activeTab === 'all' && '开始新的对话或添加联系人'}
                                    {activeTab === 'unread' && '所有消息都已阅读'}
                                    {activeTab === 'mentions' && '当有人提到您时，消息将显示在这里'}
                                    {activeTab === 'direct' && '添加联系人开始一对一聊天'}
                                    {activeTab === 'group' && '创建群组或加入现有群组'}
                                </EmptySubtext>
                                <ActionButton>
                                    {activeTab === 'all' && '开始新对话'}
                                    {activeTab === 'unread' && '查看所有消息'}
                                    {activeTab === 'mentions' && '查看通知设置'}
                                    {activeTab === 'direct' && '添加联系人'}
                                    {activeTab === 'group' && '创建群组'}
                                </ActionButton>
                            </EmptyState>
                        )}
                    </MainContent>
                </ContentContainer>
            </SidebarContainer>

            {/* Settings Dialog */}
            {isSettingsOpen && (
                <SettingsOverlay>
                    <SettingsPanel>
                        <CloseButton onClick={() => setIsSettingsOpen(false)}>
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </CloseButton>
                        <SettingsPage />
                    </SettingsPanel>
                </SettingsOverlay>
            )}
        </>
    );
};

// 获取标签名称
const getTabLabel = (tab: TabType): string => {
    switch (tab) {
        case 'all': return '所有会话';
        case 'unread': return '未读消息';
        case 'mentions': return '@ 提到我';
        case 'direct': return '单聊会话';
        case 'group': return '群聊会话';
        default: return '';
    }
};

export default Sidebar;
