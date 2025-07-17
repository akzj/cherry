import React, { useState } from 'react';
import styled from 'styled-components';
import { Conversation, User } from '@/types';
import ContactList from '../ContactList';
import ContactPage from '../ContactPage';
import Header from './Header';
import MainNavigation, { MainNavType } from './MainNavigation';
import SecondaryNavigation, { TabType } from './SecondaryNavigation';
import EmptyState from './EmptyState';

interface SidebarProps {
    conversations: Conversation[];
    currentUser: User;
    onSelectConversation: (id: string) => void;
    onOpenSettings: () => void;
    activeMainNav: MainNavType;
    setActiveMainNav: (nav: MainNavType) => void;
}

const SidebarContainer = styled.div`
  width: 460px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  color: #1f2937;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const SecondaryContentContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 1rem;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const Sidebar: React.FC<SidebarProps> = ({
    conversations,
    onSelectConversation,
    onOpenSettings,
    activeMainNav,
    setActiveMainNav
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
        setActiveMainNav('contacts');
    };

    const handleMainNavChange = (nav: MainNavType) => {
        setActiveMainNav(nav);
        if (nav === 'messages') {
            setActiveTab('all');
        }
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <SidebarContainer>
            {/* 只在消息模式下显示 Header */}
            {activeMainNav === 'messages' && (
                <Header
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onOpenContacts={handleOpenContacts}
                    onOpenSettings={onOpenSettings}
                />
            )}

            <ContentContainer>
                <MainNavigation
                    activeMainNav={activeMainNav}
                    onNavChange={handleMainNavChange}
                    onOpenSettings={onOpenSettings}
                    unreadCount={unreadCount}
                    mentionCount={mentionCount}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {activeMainNav === 'messages' ? (
                        <SecondaryContentContainer>
                            <SecondaryNavigation
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                unreadCount={unreadCount}
                                mentionCount={mentionCount}
                                totalCount={conversations.length}
                            />

                            <MainContent>
                                {filteredConversations.length > 0 ? (
                                    <ContactList
                                        conversations={filteredConversations}
                                        onSelectConversation={onSelectConversation}
                                    />
                                ) : (
                                    <EmptyState activeTab={activeTab} />
                                )}
                            </MainContent>
                        </SecondaryContentContainer>
                    ) : (
                        <SecondaryContentContainer>
                            <ContactPage 
                                onSelectConversation={onSelectConversation}
                                onSwitchToMessages={() => setActiveMainNav('messages')}
                            />
                        </SecondaryContentContainer>
                    )}
                </div>
            </ContentContainer>
        </SidebarContainer>
    );
};

export default Sidebar;
export type { MainNavType, TabType };
