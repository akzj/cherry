import React, { useState } from 'react';
import styled from 'styled-components';
import { Group } from '../../types/contact';
import Avatar from '../UI/Avatar';
import { FaCrown, FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface GroupSectionProps {
  title: string;
  groups: Group[];
}

// ==================== Styled Components ====================
const SectionContainer = styled.div`
  margin-bottom: 1.75rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  color: rgba(41, 56, 59, 0.7);
  user-select: none;
  transition: all 0.3s ease;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    
    .section-title {
      color: rgba(33, 65, 54, 0.9);
    }
    
    .collapse-icon {
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CollapseIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);
  
  svg {
    width: 0.85rem;
    height: 0.85rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  text-color: rgba(9, 33, 98, 0.66);
  letter-spacing: 0.05em;
  color: rgba(51, 89, 97, 0.7);
  position: relative;
  flex-grow: 1;
  transition: color 0.3s ease;
  margin: 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 1px;
    width: 100%;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.2), transparent);
    z-index: 0;
  }
  
  span {
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    padding: 0 0.5rem 0 0;
  }
`;

const GroupCount = styled.span`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  padding: 0.375rem 0.75rem;
  margin-left: 0.5rem;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
`;

const GroupCard = styled.div<{ $expanded: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${({ $expanded }) => $expanded ? '1000px' : '0'};
  opacity: ${({ $expanded }) => $expanded ? '1' : '0'};
  transform: translateY(${({ $expanded }) => $expanded ? '0' : '-10px'});
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const GroupItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 1.25rem;
    right: 1.25rem;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    z-index: 1;
    border-radius: 12px;
    
    &::after {
      opacity: 0;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const GroupInfo = styled.div`
  margin-left: 1rem;
  flex: 1;
`;

const GroupName = styled.div`
  font-weight: 600;
  color: rgba(10, 10, 10, 0.7);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
`;

const GroupMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(10, 10, 10, 0.6);
`;

const MemberCount = styled.span`
  margin-right: 0.75rem;
  font-weight: 500;
`;

const OwnerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem 0.25rem 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  
  svg {
    margin-right: 0.25rem;
    font-size: 0.7rem;
  }
`;

// ==================== Component Implementation ====================
const GroupSection: React.FC<GroupSectionProps> = ({ title, groups }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <SectionContainer>
      <SectionHeader onClick={toggleExpand}>
        <CollapseIcon className="collapse-icon">
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
        </CollapseIcon>

        <SectionTitle className="section-title">
          <span>{title}</span>
        </SectionTitle>

        <GroupCount>{groups.length}</GroupCount>
      </SectionHeader>

      <GroupCard $expanded={isExpanded}>
        {groups.map(group => (
          <GroupItem
            key={group.id}
            onClick={() => console.log('Group clicked', group.id)}
          >
            <Avatar src={group.avatar} alt={group.name} size="md" />

            <GroupInfo>
              <GroupName>{group.name}</GroupName>

              <GroupMeta>
                <MemberCount>{group.memberCount} 成员</MemberCount>

                {group.isOwner && (
                  <OwnerBadge>
                    <FaCrown />
                    创建者
                  </OwnerBadge>
                )}
              </GroupMeta>
            </GroupInfo>
          </GroupItem>
        ))}
      </GroupCard>
    </SectionContainer>
  );
};

export default GroupSection;
