import styled from 'styled-components';

// ==================== Styled Components ====================
export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,rgb(169, 231, 168) 0%,rgb(75, 150, 162) 100%);
  position: relative;
  overflow: hidden;
  padding: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

export const LoginCard = styled.div`
  width: 100%;
  max-width: 28rem;
  background: rgba(234, 232, 232, 0.17);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

export const HeaderSection = styled.div`
  background: linear-gradient(135deg,rgb(163, 164, 198) 0%, #8b5cf6 100%);
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(136, 218, 192, 0.59) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  }
`;

export const HeaderTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  position: relative;
  z-index: 1;
`;

export const HeaderSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  position: relative;
  z-index: 1;
`;

export const FormContainer = styled.form`
  padding: 2rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
`;

export const Input = styled.input<{ $hasError: boolean }>`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid ${({ $hasError }) => $hasError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 16px;
  color: black;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 
      0 0 0 3px rgba(99, 102, 241, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

export const ErrorMessage = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #fca5a5;
  font-weight: 500;
`;

export const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: #6366f1;
  border-radius: 4px;
`;

export const CheckboxLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
`;

export const ForgotLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: white;
  }
`;

export const SubmitButton = styled.button<{ $isSubmitting: boolean }>`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ $isSubmitting }) => $isSubmitting ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(99, 102, 241, 0.3),
      0 4px 15px rgba(139, 92, 246, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

export const FooterSection = styled.div`
  padding: 2rem 2rem 2.5rem 2rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

export const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0;
`;

export const SignUpLink = styled.a`
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  
  &:hover {
    color: #8b5cf6;
  }
`;

export const SocialLoginSection = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SocialText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
`;

export const SocialButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
`;

export const SocialButton = styled.button`
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 1.3rem;
  box-shadow: 0 2px 8px rgba(80, 80, 120, 0.08);

  &:hover {
    background: rgba(255,255,255,0.22);
    transform: translateY(-2px) scale(1.08);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: rgba(255,255,255,0.9);
  }
`;

export const CloseButton = styled.button`
  position: fixed;
  top: 32px;
  right: 32px;
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.18);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(80, 80, 120, 0.08);

  &:hover {
    background: rgba(255,255,255,0.32);
    transform: scale(1.08);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
    color: #888;
  }
`; 