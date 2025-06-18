import { useState } from 'react';
import styled, { css } from 'styled-components';
import ContactGroup from './ContactGroup';
import GroupSection from './GroupSection';
import { mockContactGroups, mockOwnedGroups, mockJoinedGroups } from '../../data/mockContacts';
import { FaUserFriends, FaUsers, FaPlus, FaSearch } from 'react-icons/fa';

interface SidebarButtonProps {
  $active?: boolean;
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(175, 222, 227) 100%);
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
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Sidebar = styled.div`
  width: 200px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
`;

const SidebarHeader = styled.div`
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(68, 38, 38, 0.9);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: #6366f1;
    font-size: 1.5rem;
  }
`;

const SidebarNav = styled.nav`
  margin-top: 1rem;
  padding: 0 1rem;
`;

const SidebarButton = styled.button<SidebarButtonProps>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  color: ${props => props.$active ? 'rgba(0, 0, 0, 0.8)' : 'rgba(9, 29, 34, 0.7)'};
  background: ${props => props.$active
    ? 'rgba(162, 184, 195, 0.35)'
    : 'rgba(255, 255, 255, 0.05)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 0.75rem;
  border: 1px solid ${props => props.$active
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(255, 255, 255, 0.1)'
  };
  text-align: left;
  margin-bottom: 0.5rem;
  
  ${props => props.$active && css`
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 1.125rem;
    flex-shrink: 0;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Header = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: rgba(51, 103, 107, 0.9);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:focus-within {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 
      0 0 0 3px rgba(99, 102, 241, 0.1),
      0 6px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.25rem;
  border: none;
  font-size: 1rem;
  background: rgba(224, 186, 186, 0.1);
  color: rgba(10, 10, 10, 0.8);
  font-weight: 400;
  
  &::placeholder {
    color: rgba(16, 60, 30, 0.6);
  }
  
  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
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
    font-size: 1rem;
  }
`;

const NewGroupButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg,rgb(75, 152, 165) 0%,rgb(144, 37, 150) 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.25rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(99, 102, 241, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

const ContentSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ContactPage = () => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [searchQuery, setSearchQuery] = useState('');

  const contactGroups = mockContactGroups;
  const ownedGroups = mockOwnedGroups;
  const joinedGroups = mockJoinedGroups;

  return (
    <Container>
      <Sidebar>
        <SidebarHeader>
          <FaUserFriends />
          <span>通讯录</span>
        </SidebarHeader>
        <SidebarNav>
          <SidebarButton
            $active={activeTab === 'contacts'}
            onClick={() => setActiveTab('contacts')}
          >
            <FaUserFriends />
            联系人
          </SidebarButton>
          <SidebarButton
            $active={activeTab === 'groups'}
            onClick={() => setActiveTab('groups')}
          >
            <FaUsers />
            群组
          </SidebarButton>
        </SidebarNav>
      </Sidebar>

      <MainContent>
        {activeTab === 'contacts' ? (
          <>
            <HeaderContainer>
              <Header>联系人</Header>
              <NewGroupButton>
                <FaPlus />
                新建分组
              </NewGroupButton>
            </HeaderContainer>

            <SearchBar>
              <SearchInput
                type="text"
                placeholder="搜索联系人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchButton>
                <FaSearch />
              </SearchButton>
            </SearchBar>

            <ContentSection>
              {contactGroups.map(group => (
                <ContactGroup key={group.id} group={group} />
              ))}
            </ContentSection>
          </>
        ) : (
          <>
            <HeaderContainer>
              <Header>群组</Header>
              <NewGroupButton>
                <FaPlus />
                创建新群
              </NewGroupButton>
            </HeaderContainer>

            <SearchBar>
              <SearchInput
                type="text"
                placeholder="搜索群组..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchButton>
                <FaSearch />
              </SearchButton>
            </SearchBar>

            <ContentSection>
              <GroupSection title="我创建的群" groups={ownedGroups} />
            </ContentSection>

            <ContentSection>
              <GroupSection title="我加入的群" groups={joinedGroups} />
            </ContentSection>
          </>
        )}
      </MainContent>
    </Container>
  );
};

export default ContactPage;
