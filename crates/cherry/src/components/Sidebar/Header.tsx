import React from 'react';
import styled from 'styled-components';
import { FaUserFriends } from 'react-icons/fa';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onOpenContacts: () => void;
    onOpenSettings: () => void;
}

const HeaderContainer = styled.div`
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

const Header: React.FC<HeaderProps> = ({
    searchQuery,
    onSearchChange,
    onOpenContacts,
    onOpenSettings
}) => {
    return (
        <HeaderContainer>
            <HeaderActions>
                <IconButton onClick={onOpenContacts}>
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
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </SearchContainer>
        </HeaderContainer>
    );
};

export default Header;
