import React, { useState } from 'react';
import ContactGroup from './ContactGroup';
import GroupSection from './GroupSection';
import type { Group } from '../../types/contact';
import { mockContactGroups, mockOwnedGroups, mockJoinedGroups } from '../../data/mockContacts';
import styled, { css } from 'styled-components';
import { FaUserFriends, FaUsers, FaPlus, FaSearch } from 'react-icons/fa';

interface SidebarButtonProps {
  $active?: boolean;
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
`;

const Sidebar = styled.div`
  width: 260px;
  border-right: 1px solid #e4e7eb;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 24px 20px 18px;
  border-bottom: 1px solid #e8e8e8;
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #4299e1;
  }
`;

const SidebarNav = styled.nav`
  margin-top: 16px;
  padding: 0 12px;
`;

const SidebarButton = styled.button<SidebarButtonProps>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  color: #4a5568;
  background-color: ${props => props.$active ? '#ebf8ff' : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  gap: 12px;
  border: none;
  text-align: left;
  
  ${props => props.$active && css`
    color: #3182ce;
    font-weight: 600;
  `}

  &:hover {
    background-color: ${props => props.$active ? '#ebf8ff' : '#f7fafc'};
  }
  
  svg {
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  background-color: #f5f7fa;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Header = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 14px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #ebf8ff;
  }
`;

const SearchButton = styled.button`
  padding: 0 16px;
  background-color: #4299e1;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const NewGroupButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(66, 153, 225, 0.3);
  
  &:hover {
    background-color: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(66, 153, 225, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(66, 153, 225, 0.3);
  }
`;

const ContentSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
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
