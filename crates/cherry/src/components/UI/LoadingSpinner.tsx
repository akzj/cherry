import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: rgba(99, 102, 241, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const Dot = styled.div<{ delay: number }>`
  width: 6px;
  height: 6px;
  background: #6366f1;
  border-radius: 50%;
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = '加载中...', 
  size = 'medium' 
}) => {
  const spinnerSize = {
    small: '24px',
    medium: '40px',
    large: '60px'
  }[size];

  const StyledSpinner = styled(Spinner)`
    width: ${spinnerSize};
    height: ${spinnerSize};
  `;

  return (
    <LoadingContainer>
      <StyledSpinner />
      <LoadingText>{text}</LoadingText>
      <LoadingDots>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </LoadingDots>
    </LoadingContainer>
  );
};

export default LoadingSpinner; 