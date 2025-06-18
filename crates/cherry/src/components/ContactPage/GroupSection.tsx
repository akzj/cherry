import React, { useState } from 'react';
import styled, { css } from 'styled-components';
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
  padding: 0.5rem 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  
  &:hover {
    background-color: #f1f5f9;
    
    .section-title {
      color: #475569;
    }
    
    .collapse-icon {
      transform: scale(1.1);
    }
  }
`;

const CollapseIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  transition: all 0.3s ease;
  color: #94a3b8;
  
  svg {
    width: 0.85rem;
    height: 0.85rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  position: relative;
  flex-grow: 1;
  transition: color 0.2s ease;
  margin: 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 1px;
    width: 100%;
    background: linear-gradient(to right, #e2e8f0, transparent);
    z-index: 0;
  }
  
  span {
    position: relative;
    z-index: 1;
    background-color: #f8fafc;
    padding: 0 0.5rem 0 0;
  }
`;

const GroupCount = styled.span`
  background-color: #e2e8f0;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  margin-left: 0.5rem;
  z-index: 1;
`;

const GroupCard = styled.div<{ $expanded: boolean }>`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${({ $expanded }) => $expanded ? '1000px' : '0'};
  opacity: ${({ $expanded }) => $expanded ? '1' : '0'};
  transform: translateY(${({ $expanded }) => $expanded ? '0' : '-10px'});
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
    background-color: #f1f5f9;
  }
  
  &:hover {
    background-color: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    z-index: 1;
    border-radius: 8px;
    
    &::after {
      opacity: 0;
    }
  }
`;

const GroupInfo = styled.div`
  margin-left: 1rem;
  flex: 1;
`;

const GroupName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
`;

const GroupMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #64748b;
`;

const MemberCount = styled.span`
  margin-right: 0.75rem;
`;

const OwnerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(to right, #fef3c7, #fde68a);
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem 0.25rem 0.5rem;
  border-radius: 9999px;
  
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
