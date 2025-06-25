import styled from 'styled-components';
import { FaUserFriends, FaUsers, FaSearch } from 'react-icons/fa';

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
  text-align: center;
`;

const EmptyIcon = styled.div<{ color?: string }>`
  color: ${props => props.color || '#9ca3af'};
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const EmptyMessage = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  max-width: 300px;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  margin-top: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

interface EmptyStateProps {
  type: 'contacts' | 'groups' | 'search';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionText,
  onAction,
  showAction = true
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'contacts':
        return {
          icon: <FaUserFriends />,
          defaultTitle: '暂无联系人',
          defaultMessage: '您还没有添加任何联系人。点击下方按钮开始添加好友。',
          defaultActionText: '添加联系人',
          color: '#6366f1'
        };
      case 'groups':
        return {
          icon: <FaUsers />,
          defaultTitle: '暂无群组',
          defaultMessage: '您还没有创建或加入任何群组。点击下方按钮创建新群组。',
          defaultActionText: '创建群组',
          color: '#8b5cf6'
        };
      case 'search':
        return {
          icon: <FaSearch />,
          defaultTitle: '未找到结果',
          defaultMessage: '没有找到匹配的联系人或群组。请尝试其他搜索关键词。',
          defaultActionText: '重新搜索',
          color: '#9ca3af'
        };
      default:
        return {
          icon: <FaUserFriends />,
          defaultTitle: '暂无数据',
          defaultMessage: '暂时没有数据可显示。',
          defaultActionText: '刷新',
          color: '#9ca3af'
        };
    }
  };

  const content = getDefaultContent();

  return (
    <EmptyContainer>
      <EmptyIcon color={content.color}>
        {content.icon}
      </EmptyIcon>
      <EmptyTitle>{title || content.defaultTitle}</EmptyTitle>
      <EmptyMessage>{message || content.defaultMessage}</EmptyMessage>
      {showAction && onAction && (
        <ActionButton onClick={onAction}>
          {content.icon}
          {actionText || content.defaultActionText}
        </ActionButton>
      )}
    </EmptyContainer>
  );
};

export default EmptyState; 