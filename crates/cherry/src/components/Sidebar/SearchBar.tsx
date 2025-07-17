import React from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    placeholder?: string;
}

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background-color: rgba(255, 255, 255, 0.95);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SearchBar: React.FC<SearchBarProps> = ({ 
    searchQuery, 
    onSearchChange, 
    placeholder = "搜索会话..." 
}) => {
    return (
        <SearchContainer>
            <SearchIcon>
                <FaSearch />
            </SearchIcon>
            <SearchInput
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </SearchContainer>
    );
};

export default SearchBar;
