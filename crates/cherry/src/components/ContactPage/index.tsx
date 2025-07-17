import { useState, useEffect } from 'react';
import styled from 'styled-components';
import ContactItem from './ContactItem';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { useContactStore } from '../../store/contact';
import { FaUserFriends } from 'react-icons/fa';
import { Contact } from '@/types';
import ContactProfileModal from './ContactProfileModal';
import { useConversationStore } from '../../store/conversation';

interface ContactPageProps {
  onSelectConversation?: (conversationId: string) => void;
  onSwitchToMessages?: () => void; // 添加切换到消息模式的回调
}

// 联系人二级导航类型
type ContactTabType = 'contacts' | 'groups' | 'tags';

// ==================== Styled Components ====================

const ContactContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 1rem;
`;

const ContactTabsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.5);
`;

const ContactTabButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? '#6366f1' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#5856eb' : 'rgba(99, 102, 241, 0.1)'};
    color: ${props => props.$active ? 'white' : '#6366f1'};
  }
`;

const ContactMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContactEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  
  svg {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    color: #9ca3af;
  }
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }
  
  p {
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    color: #6b7280;
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

const ContactPage: React.FC<ContactPageProps> = ({ onSelectConversation, onSwitchToMessages }) => {
  const [activeTab, setActiveTab] = useState<ContactTabType>('contacts');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // 使用联系人 store
  const {
    contacts,
    isLoading,
    error,
    refreshContacts
  } = useContactStore();

  const conversationStore = useConversationStore();

  // 组件挂载时加载数据
  useEffect(() => {
    if (activeTab === 'contacts') {
      refreshContacts();
    }
  }, [activeTab, refreshContacts]);

  // 处理消息操作
  const handleMessageContact = async (contact: Contact) => {
    // 创建或获取会话
    const convId = await conversationStore.createDirectConversation(contact.target_id);
    if (convId && onSelectConversation) {
      onSelectConversation(convId);
    }
    // 切换到消息模式
    if (onSwitchToMessages) {
      onSwitchToMessages();
    }
  };

  // 处理语音通话
  const handleVoiceCall = (contact: Contact) => {
    // TODO: 发起语音通话
    console.log('Voice call to:', contact.remark_name);
  };

  // 处理视频通话
  const handleVideoCall = (contact: Contact) => {
    // TODO: 发起视频通话
    console.log('Video call to:', contact.remark_name);
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

    if (contacts.length === 0) {
      return (
        <ContactEmptyState>
          <FaUserFriends />
          <h3>暂无联系人</h3>
          <p>开始添加联系人吧</p>
          <ContactActionButton onClick={refreshContacts}>
            刷新联系人
          </ContactActionButton>
        </ContactEmptyState>
      );
    }

    // 根据活动标签显示不同内容
    if (activeTab === 'contacts') {
      // 直接显示联系人列表，不使用 ContactGroup 组件
      const sortedContacts = contacts.sort((a, b) => 
        (a.remark_name || a.target_id || '').localeCompare(b.remark_name || b.target_id || '')
      );

      return (
        <ContactSection>
          {sortedContacts.map(contact => (
            <ContactItem
              key={contact.target_id}
              contact={contact}
              onClick={() => setSelectedContact(contact)}
              onMessage={() => handleMessageContact(contact)}
              onVoiceCall={() => handleVoiceCall(contact)}
              onVideoCall={() => handleVideoCall(contact)}
            />
          ))}
        </ContactSection>
      );
    } else if (activeTab === 'groups') {
      return (
        <ContactEmptyState>
          <FaUserFriends />
          <h3>暂无群组</h3>
          <p>群组功能即将上线</p>
        </ContactEmptyState>
      );
    } else if (activeTab === 'tags') {
      return (
        <ContactEmptyState>
          <FaUserFriends />
          <h3>暂无收藏</h3>
          <p>收藏功能即将上线</p>
        </ContactEmptyState>
      );
    }

    return null;
  };

  // 渲染主要内容
  return (
    <ContactContainer>
      {/* 联系人标签导航 */}
      <ContactTabsContainer>
        <ContactTabButton 
          $active={activeTab === 'contacts'} 
          onClick={() => setActiveTab('contacts')}
        >
          联系人
        </ContactTabButton>
        <ContactTabButton 
          $active={activeTab === 'groups'} 
          onClick={() => setActiveTab('groups')}
        >
          群组
        </ContactTabButton>
        <ContactTabButton 
          $active={activeTab === 'tags'} 
          onClick={() => setActiveTab('tags')}
        >
          收藏
        </ContactTabButton>
      </ContactTabsContainer>

      {/* 联系人内容区域 */}
      <ContactMainContent>
        <ContactContentArea>
          {renderContactsContent()}
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
            // 切换到消息模式
            if (onSwitchToMessages) {
              onSwitchToMessages();
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
