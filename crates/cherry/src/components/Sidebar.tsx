// src/components/Sidebar.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Conversation, User } from '@/types';
import ContactList from './ContactList.tsx';
import { FaUserFriends } from 'react-icons/fa';

interface SidebarProps {
    conversations: Conversation[];
    currentUser: User;
    onSelectConversation: (id: string) => void;
    onOpenSettings: () => void;
    onOpenContacts: () => void;
}

type TabType = 'all' | 'unread' | 'mentions' | 'direct' | 'group';

// ==================== Styled Components ====================
const SidebarContainer = styled.div`
  width: 420px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  color: #1f2937;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  padding: 1.5rem;
  
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: rgba(99, 102, 241, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #6b7280;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  color: #1f2937;
  border: 1px solid rgba(229, 231, 235, 0.5);
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:focus {
    background-color: rgba(255, 255, 255, 0.95);
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 1rem;
`;

const VerticalNav = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
`;

const NavButton = styled.button<{ $active?: boolean }>`
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
  background-color: ${props => props.$active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  border-radius: 12px;
  margin-bottom: 0.5rem;
  
  &:hover {
    background-color: ${props => props.$active ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.05)'};
    transform: translateY(-1px);
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
  top: -0.5rem;
  right: -0.5rem;
  background-color: ${props => props.$bgColor || props.$color || '#ef4444'};
  color: white;
  font-size: 0.65rem;
  border-radius: 9999px;
  height: 1.25rem;
  width: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
`;

const NavLabel = styled.span<{ $active?: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  color: ${props => props.$active ? '#6366f1' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '500'};
`;

const NavSpacer = styled.div`
  flex: 1;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  padding-top: 1rem;
  margin-top: 0.5rem;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ContentHeader = styled.div`
  padding: 0.5rem 1.5rem 1rem;
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  color:rgb(63, 149, 73);
`;

const StatusBadge = styled.span<{ $color?: string, $bgColor?: string }>`
  margin-left: 0.75rem;
  background-color: ${props => props.$bgColor || '#6366f1'};
  color: ${props => props.$color || 'white'};
  font-size: 0.75rem;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 80px);
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(249, 250, 251, 0.5), rgba(243, 244, 246, 0.5));
`;

const EmptyIcon = styled.div`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 50%;
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: #6366f1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  svg {
    width: 48px;
    height: 48px;
  }
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1f2937;
`;

const EmptySubtext = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  color: #6b7280;
  line-height: 1.5;
  max-width: 320px;
`;

const ActionButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// ==================== Component Implementation ====================
const Sidebar: React.FC<SidebarProps> = ({
    conversations,
    onSelectConversation,
    onOpenSettings,
    onOpenContacts
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // 计算各类会话数量
    const unreadCount = conversations.filter(c => c.unreadCount > 0).length;
    const mentionCount = conversations.filter(c => c.mentions > 0).length;

    // 根据当前标签过滤会话
    const filteredConversations = conversations.filter(conversation => {
        const matchesSearch = conversation.name.toLowerCase().includes(searchQuery.toLowerCase());

        switch (activeTab) {
            case 'unread':
                return matchesSearch && conversation.unreadCount > 0;
            case 'mentions':
                return matchesSearch && conversation.mentions > 0;
            case 'direct':
                return matchesSearch && conversation.type === 'direct';
            case 'group':
                return matchesSearch && conversation.type === 'group';
            default:
                return matchesSearch;
        }
    });

    const handleOpenContacts = () => {
        onOpenContacts();
    };

    return (
        <>
            <SidebarContainer>
                <Header>
                    <HeaderActions>
                        <IconButton onClick={handleOpenContacts}>
                            <FaUserFriends />
                        </IconButton>
                        <IconButton onClick={onOpenSettings}>
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </IconButton>
                    </HeaderActions>

                    <SearchContainer>
                        <SearchIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder="搜索对话..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                                <NavLabel $active={activeTab === 'mentions'}>@我</NavLabel>
                            </NavIconWrapper>
                        </NavButton>


                        <NavButton
                            $active={activeTab === 'unread'}
                            onClick={() => setActiveTab('unread')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'unread' ? '#6366f1' : '#9ca3af'}>
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                                {unreadCount > 0 && (
                                    <Badge $color="#ef4444">{unreadCount}</Badge>
                                )}
                                <NavLabel $active={activeTab === 'unread'}>未读</NavLabel>
                            </NavIconWrapper>
                        </NavButton>


                        <NavButton
                            $active={activeTab === 'all'}
                            onClick={() => setActiveTab('all')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'all' ? '#6366f1' : '#9ca3af'}>
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {conversations.length > 0 && (
                                    <Badge>{conversations.length}</Badge>
                                )}
                                <NavLabel $active={activeTab === 'all'}>会话</NavLabel>
                            </NavIconWrapper>
                        </NavButton>




                        <NavButton
                            $active={activeTab === 'direct'}
                            onClick={() => setActiveTab('direct')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'direct' ? '#6366f1' : '#9ca3af'}>
                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                </svg>
                                <NavLabel $active={activeTab === 'direct'}>单聊</NavLabel>
                            </NavIconWrapper>
                        </NavButton>

                        <NavButton
                            $active={activeTab === 'group'}
                            onClick={() => setActiveTab('group')}
                        >
                            <NavIconWrapper>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'group' ? '#6366f1' : '#9ca3af'}>
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                <NavLabel $active={activeTab === 'group'}>群聊</NavLabel>
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
