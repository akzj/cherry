import React from 'react';
import styled from 'styled-components';
import { FaUserFriends, FaComment, FaBookmark } from 'react-icons/fa';

type MainNavType = 'messages' | 'contacts';

interface MainNavigationProps {
    activeMainNav: MainNavType;
    onNavChange: (nav: MainNavType) => void;
    onOpenSettings: () => void;
    unreadCount: number;
    mentionCount: number;
}

const MainNavContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(243, 244, 246, 0.7);
  width: 70px;
  height: 100%;
  align-items: center;
  padding: 1.5rem 0;
  border-right: 1px solid rgba(229, 231, 235, 0.5);
`;

const MainNavButton = styled.button<{ $active?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background-color: ${props => props.$active ? 'rgba(99, 102, 241, 0.15)' : 'transparent'};
  transition: all 0.2s ease;
  position: relative;
  
  svg {
    width: 22px;
    height: 22px;
    color: ${props => props.$active ? '#6366f1' : '#6b7280'};
    transition: all 0.2s ease;
  }
  
  &:hover {
    background-color: ${props => props.$active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};
    transform: translateY(-2px);
    
    svg {
      color: ${props => props.$active ? '#6366f1' : '#4b5563'};
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    height: ${props => props.$active ? '20px' : '0'};
    width: 4px;
    background-color: #6366f1;
    border-radius: 0 4px 4px 0;
    transition: all 0.2s ease;
  }
`;

const MainNavDivider = styled.div`
  width: 30px;
  height: 1px;
  background-color: rgba(156, 163, 175, 0.3);
  margin: 0.75rem 0;
`;

const Badge = styled.span`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: #ef4444;
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

const MainNavigation: React.FC<MainNavigationProps> = ({
    activeMainNav,
    onNavChange,
    onOpenSettings,
    unreadCount,
    mentionCount
}) => {
    return (
        <MainNavContainer>
            <MainNavButton 
                $active={activeMainNav === 'messages'} 
                onClick={() => onNavChange('messages')}
            >
                <FaComment />
                {(unreadCount > 0 || mentionCount > 0) && (
                    <Badge>{unreadCount + mentionCount}</Badge>
                )}
            </MainNavButton>
            
            <MainNavButton 
                $active={activeMainNav === 'contacts'} 
                onClick={() => onNavChange('contacts')}
            >
                <FaUserFriends />
            </MainNavButton>
            
            <MainNavButton>
                <FaBookmark />
            </MainNavButton>
            
            <MainNavDivider />
            
            <MainNavButton onClick={onOpenSettings}>
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
            </MainNavButton>
        </MainNavContainer>
    );
};

export default MainNavigation;
export type { MainNavType };
