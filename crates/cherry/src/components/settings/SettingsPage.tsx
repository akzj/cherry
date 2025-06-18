import React, { useState } from 'react';
import styled from 'styled-components';
import GeneralSettings from './GeneralSettings';
import PrivacySettings from './PrivacySettings';
import NotificationSettings from './NotificationSettings';
import AppearanceSettings from './AppearanceSettings';

type SettingCategory = 'general' | 'privacy' | 'notifications' | 'appearance';

// ==================== Styled Components ====================
const SettingsContainer = styled.div`
  display: flex;
  height: 100%;
  background: linear-gradient(135deg, rgb(190, 216, 199) 0%, rgba(240, 221, 242, 0.83) 100%);
`;

const Sidebar = styled.div`
  width: 280px;
  // background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(134, 239, 172, 0.2);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(89, 220, 209, 0.1);
`;

const SidebarHeader = styled.div`
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(134, 239, 172, 0.2);
  // background: linear-gradient(135deg, rgba(134, 239, 172, 0.1), rgba(147, 197, 253, 0.05));
`;

const SidebarTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(22, 57, 35, 0.8);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SidebarSubtitle = styled.p`
  font-size: 0.875rem;
  color: rgb(11, 36, 8);
  margin: 0.5rem 0 0;
`;

const NavigationContainer = styled.nav`
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: auto;
  
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavButton = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  margin-bottom: 0.5rem;
  border-radius: 16px;
  border: 1px solid ${props => props.$active ? 'rgba(134, 239, 172, 0.3)' : 'transparent'};
  background: ${props => props.$active
    ? 'rgba(96, 222, 140, 0.15)'
    : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active
    ? 'rgba(10, 40, 21, 0.9)'
    : 'rgba(92, 193, 155, 0.7)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${props => props.$active
    ? 'rgba(134, 239, 172, 0.2)'
    : 'rgba(134, 239, 172, 0.1)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(134, 239, 172, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none !important;
    border-color: rgba(134, 239, 172, 0.4) !important;
    box-shadow: 0 0 0 2px rgba(134, 239, 172, 0.2) !important;
  }
`;

const NavIcon = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  // background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ContentHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(5, 15, 9, 0.2);
`;

const ContentTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(5, 28, 13, 0.61);
  margin: 0 0 0.5rem 0;
`;

const ContentDescription = styled.p`
  font-size: 0.95rem;
  color: rgba(14, 40, 23, 0.7);
  margin: 0;
  line-height: 1.5;
`;

const SettingsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('general');
  const [darkMode, setDarkMode] = useState(false);

  const getCategoryInfo = (category: SettingCategory) => {
    switch (category) {
      case 'general':
        return { title: '通用设置', description: '管理应用程序的基本设置和偏好' };
      case 'privacy':
        return { title: '隐私设置', description: '控制您的隐私和数据安全选项' };
      case 'notifications':
        return { title: '通知设置', description: '自定义消息和系统通知的显示方式' };
      case 'appearance':
        return { title: '外观设置', description: '个性化界面主题和显示选项' };
      default:
        return { title: '', description: '' };
    }
  };

  const renderSettingsContent = () => {
    switch (activeCategory) {
      case 'general':
        return <GeneralSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <GeneralSettings />;
    }
  };

  const categoryInfo = getCategoryInfo(activeCategory);

  return (
    <SettingsContainer>
      {/* 侧边导航 */}
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>设置</SidebarTitle>
          <SidebarSubtitle>个性化您的聊天体验</SidebarSubtitle>
        </SidebarHeader>

        <NavigationContainer>
          {(['general', 'privacy', 'notifications', 'appearance'] as SettingCategory[]).map((category) => (
            <NavButton
              key={category}
              $active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              <NavIcon>
                {category === 'general' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {category === 'privacy' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                {category === 'notifications' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 004 6v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-1.81 1.19z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                )}
                {category === 'appearance' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                )}
              </NavIcon>
              <span>
                {category === 'general' && '通用'}
                {category === 'privacy' && '隐私'}
                {category === 'notifications' && '通知'}
                {category === 'appearance' && '外观'}
              </span>
            </NavButton>
          ))}
        </NavigationContainer>
      </Sidebar>

      {/* 主内容区 */}
      <MainContent>
        <ContentContainer>
          <ContentHeader>
            <ContentTitle>{categoryInfo.title}</ContentTitle>
            <ContentDescription>{categoryInfo.description}</ContentDescription>
          </ContentHeader>

          {renderSettingsContent()}
        </ContentContainer>
      </MainContent>
    </SettingsContainer>
  );
};

export default SettingsPage;
