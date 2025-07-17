import React from 'react';
import styled from 'styled-components';

type TabType = 'all' | 'unread' | 'mentions' | 'direct' | 'group';

interface SecondaryNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    unreadCount: number;
    mentionCount: number;
    totalCount: number;
}

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

const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({
    activeTab,
    onTabChange,
    unreadCount,
    mentionCount,
    totalCount
}) => {
    return (
        <VerticalNav>
            <NavButton
                $active={activeTab === 'mentions'}
                onClick={() => onTabChange('mentions')}
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
                onClick={() => onTabChange('unread')}
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
                onClick={() => onTabChange('all')}
            >
                <NavIconWrapper>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={activeTab === 'all' ? '#6366f1' : '#9ca3af'}>
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {totalCount > 0 && (
                        <Badge>{totalCount}</Badge>
                    )}
                    <NavLabel $active={activeTab === 'all'}>会话</NavLabel>
                </NavIconWrapper>
            </NavButton>

            <NavButton
                $active={activeTab === 'direct'}
                onClick={() => onTabChange('direct')}
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
                onClick={() => onTabChange('group')}
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
    );
};

export default SecondaryNavigation;
export type { TabType };
