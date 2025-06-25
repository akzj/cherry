import styled from 'styled-components';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  color: #ef4444;
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const ErrorTitle = styled.h3`
  color: #dc2626;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
`;

const ErrorMessage = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  max-width: 300px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorMessageComponent: React.FC<ErrorMessageProps> = ({
  title = '出错了',
  message,
  onRetry,
  showRetry = true
}) => {
  return (
    <ErrorContainer>
      <ErrorIcon>
        <FaExclamationTriangle />
      </ErrorIcon>
      <ErrorTitle>{title}</ErrorTitle>
      <ErrorMessage>{message}</ErrorMessage>
      {showRetry && onRetry && (
        <RetryButton onClick={onRetry}>
          <FaRedo />
          重试
        </RetryButton>
      )}
    </ErrorContainer>
  );
};

export default ErrorMessageComponent; 