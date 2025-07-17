import React from 'react';
import styled from 'styled-components';
import { TabType } from './SecondaryNavigation';

interface EmptyStateProps {
    activeTab: TabType;
}

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 80px);
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(249, 250, 251, 0.5), rgba(243, 244, 246, 0.5));
`;

const EmptyIcon = styled.div`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 50%;
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: #6366f1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  svg {
    width: 48px;
    height: 48px;
  }
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1f2937;
`;

const EmptySubtext = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  color: #6b7280;
  line-height: 1.5;
  max-width: 320px;
`;

const ActionButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState: React.FC<EmptyStateProps> = ({ activeTab }) => {
    const getEmptyContent = () => {
        switch (activeTab) {
            case 'all':
                return {
                    title: '没有会话',
                    subtitle: '开始新的对话或添加联系人',
                    action: '开始新对话'
                };
            case 'unread':
                return {
                    title: '没有未读消息',
                    subtitle: '所有消息都已阅读',
                    action: '查看所有消息'
                };
            case 'mentions':
                return {
                    title: '没有提到您的消息',
                    subtitle: '当有人提到您时，消息将显示在这里',
                    action: '查看通知设置'
                };
            case 'direct':
                return {
                    title: '没有单聊会话',
                    subtitle: '添加联系人开始一对一聊天',
                    action: '添加联系人'
                };
            case 'group':
                return {
                    title: '没有群聊会话',
                    subtitle: '创建群组或加入现有群组',
                    action: '创建群组'
                };
            default:
                return {
                    title: '没有会话',
                    subtitle: '开始新的对话或添加联系人',
                    action: '开始新对话'
                };
        }
    };

    const content = getEmptyContent();

    return (
        <EmptyStateContainer>
            <EmptyIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </EmptyIcon>
            <EmptyText>{content.title}</EmptyText>
            <EmptySubtext>{content.subtitle}</EmptySubtext>
            <ActionButton>{content.action}</ActionButton>
        </EmptyStateContainer>
    );
};

export default EmptyState;
