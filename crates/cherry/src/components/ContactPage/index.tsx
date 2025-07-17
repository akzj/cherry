import { useState, useEffect } from 'react';
import styled from 'styled-components';
import ContactGroup from './ContactGroup';
import GroupSection from './GroupSection';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { useContactStore } from '../../store/contact';
import { FaUserFriends, FaUsers, FaPlus, FaSearch, FaBookmark } from 'react-icons/fa';
import { Contact } from '@/types';
import ContactProfileModal from './ContactProfileModal';
import { useConversationStore } from '../../store/conversation';

interface ContactPageProps {
  onSelectConversation?: (conversationId: string) => void;
}

// 联系人二级导航类型
type ContactTabType = 'contacts' | 'groups' | 'tags';

// ==================== Styled Components ====================

const ContactContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const ContactVerticalNav = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
  width: 120px;
  flex-shrink: 0;
`;

const ContactNavButton = styled.button<{ $active?: boolean }>`
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

const ContactNavIconWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContactNavLabel = styled.span<{ $active?: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  color: ${props => props.$active ? '#6366f1' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '500'};
`;

const ContactMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContactHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
`;

const ContactTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ContactSearchBar = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:focus-within {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ContactSearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  font-size: 0.875rem;
  background: transparent;
  color: #1f2937;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:focus {
    outline: none;
  }
`;

const ContactSearchButton = styled.button`
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

const ContactNewGroupButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 0.625rem 1rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 0.75rem;
  }
`;

const ContactContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
    
    &:hover {
      background: rgba(156, 163, 175, 0.7);
    }
  }
`;

const ContactSection = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ContactEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #6b7280;
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #d1d5db;
  }
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #374151;
  }
  
  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }
`;

const ContactActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  }
`;

// ==================== Component Implementation ====================

const ContactPage: React.FC<ContactPageProps> = ({ onSelectConversation }) => {
  const [activeTab, setActiveTab] = useState<ContactTabType>('contacts');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // 使用联系人 store
  const {
    contactGroups,
    ownedGroups,
    joinedGroups,
    isLoading,
    error,
    searchQuery,
    refreshContacts,
    refreshGroups,
    searchContacts,
    setSearchQuery
  } = useContactStore();

  const conversationStore = useConversationStore();

  // 组件挂载时加载数据
  useEffect(() => {
    if (activeTab === 'contacts') {
      refreshContacts();
    } else if (activeTab === 'groups') {
      refreshGroups();
    }
  }, [activeTab, refreshContacts, refreshGroups]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (activeTab === 'contacts') {
      searchContacts(query);
    } else if (activeTab === 'groups') {
      // 群组搜索逻辑可以在这里实现
      console.log('Searching groups:', query);
    }
  };

  // 处理创建群组
  const handleCreateGroup = () => {
    // 这里可以实现创建群组的逻辑
    console.log('Creating new group');
  };

  // 处理标签功能
  const handleTagAction = () => {
    console.log('Tag action');
  };

  // 渲染联系人内容
  const renderContactsContent = () => {
    if (isLoading) {
      return <LoadingSpinner text="加载联系人中..." />;
    }

    if (error) {
      return (
        <ErrorMessage
          title="加载失败"
          message={error}
          onRetry={refreshContacts}
        />
      );
    }

    if (contactGroups.length === 0) {
      return (
        <ContactEmptyState>
          <FaUserFriends />
          <h3>暂无联系人</h3>
          <p>{searchQuery ? '没有找到匹配的联系人' : '开始添加联系人吧'}</p>
          <ContactActionButton onClick={refreshContacts}>
            {searchQuery ? '清除搜索' : '刷新联系人'}
          </ContactActionButton>
        </ContactEmptyState>
      );
    }

    return (
      <>
        {contactGroups.map(group => (
          <ContactSection key={group.id}>
            <ContactGroup group={group} onContactClick={setSelectedContact} />
          </ContactSection>
        ))}
      </>
    );
  };

  // 渲染群组内容
  const renderGroupsContent = () => {
    if (isLoading) {
      return <LoadingSpinner text="加载群组中..." />;
    }

    if (error) {
      return (
        <ErrorMessage
          title="加载失败"
          message={error}
          onRetry={refreshGroups}
        />
      );
    }

    if (ownedGroups.length === 0 && joinedGroups.length === 0) {
      return (
        <ContactEmptyState>
          <FaUsers />
          <h3>暂无群组</h3>
          <p>创建群组开始和朋友们聊天吧</p>
          <ContactActionButton onClick={handleCreateGroup}>
            创建群组
          </ContactActionButton>
        </ContactEmptyState>
      );
    }

    return (
      <>
        {ownedGroups.length > 0 && (
          <ContactSection>
            <GroupSection title="我创建的群" groups={ownedGroups} />
          </ContactSection>
        )}
        {joinedGroups.length > 0 && (
          <ContactSection>
            <GroupSection title="我加入的群" groups={joinedGroups} />
          </ContactSection>
        )}
      </>
    );
  };

  // 渲染标签内容
  const renderTagsContent = () => {
    return (
      <ContactEmptyState>
        <FaBookmark />
        <h3>标签功能</h3>
        <p>标签功能开发中...</p>
        <ContactActionButton onClick={handleTagAction}>
          了解更多
        </ContactActionButton>
      </ContactEmptyState>
    );
  };

  // 渲染主要内容
  const renderMainContent = () => {
    switch (activeTab) {
      case 'contacts':
        return renderContactsContent();
      case 'groups':
        return renderGroupsContent();
      case 'tags':
        return renderTagsContent();
      default:
        return renderContactsContent();
    }
  };

  return (
    <ContactContainer>
      {/* 二级导航 - 联系人分类 */}
      <ContactVerticalNav>
        <ContactNavButton
          $active={activeTab === 'contacts'}
          onClick={() => setActiveTab('contacts')}
        >
          <ContactNavIconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'contacts' ? '#6366f1' : '#9ca3af'}>
              <path d="M9 12a3 3 0 11-6 0 3 3 0 016 0zM17 12a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 17a5 5 0 016-5h2a5 5 0 016 5v1H6v-1z" />
            </svg>
            <ContactNavLabel $active={activeTab === 'contacts'}>联系人</ContactNavLabel>
          </ContactNavIconWrapper>
        </ContactNavButton>

        <ContactNavButton
          $active={activeTab === 'groups'}
          onClick={() => setActiveTab('groups')}
        >
          <ContactNavIconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'groups' ? '#6366f1' : '#9ca3af'}>
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <ContactNavLabel $active={activeTab === 'groups'}>群组</ContactNavLabel>
          </ContactNavIconWrapper>
        </ContactNavButton>

        <ContactNavButton
          $active={activeTab === 'tags'}
          onClick={() => setActiveTab('tags')}
        >
          <ContactNavIconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'tags' ? '#6366f1' : '#9ca3af'}>
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <ContactNavLabel $active={activeTab === 'tags'}>标签</ContactNavLabel>
          </ContactNavIconWrapper>
        </ContactNavButton>
      </ContactVerticalNav>

      {/* 三级导航/内容区 */}
      <ContactMainContent>
        <ContactHeader>
          <ContactTitle>
            {activeTab === 'contacts' && '联系人'}
            {activeTab === 'groups' && '群组'}
            {activeTab === 'tags' && '标签'}
          </ContactTitle>
          {activeTab === 'groups' && (
            <ContactNewGroupButton onClick={handleCreateGroup}>
              <FaPlus />
              新建群组
            </ContactNewGroupButton>
          )}
        </ContactHeader>

        <ContactSearchBar>
          <ContactSearchInput
            type="text"
            placeholder={
              activeTab === 'contacts' ? '搜索联系人...' : 
              activeTab === 'groups' ? '搜索群组...' : 
              '搜索标签...'
            }
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <ContactSearchButton>
            <FaSearch />
          </ContactSearchButton>
        </ContactSearchBar>

        <ContactContentArea>
          {renderMainContent()}
        </ContactContentArea>
      </ContactMainContent>

      {/* 联系人详情弹窗 */}
      {selectedContact && (
        <ContactProfileModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onMessage={async (contact) => {
            // 创建或获取会话
            const convId = await conversationStore.createDirectConversation(contact.target_id);
            setSelectedContact(null);
            if (convId && onSelectConversation) {
              onSelectConversation(convId);
            }
          }}
          onVoiceCall={() => { /* TODO: 发起语音通话 */ setSelectedContact(null); }}
          onVideoCall={() => { /* TODO: 发起视频通话 */ setSelectedContact(null); }}
        />
      )}
    </ContactContainer>
  );
};

export default ContactPage;
