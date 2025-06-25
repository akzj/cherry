import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../store/auth';
import "../App.css";
import { Window } from '@tauri-apps/api/window';

interface FormErrors {
    [key: string]: string | undefined;
    email?: string;
    password?: string;
}

interface FormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

// ==================== Styled Components ====================
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const LoginCard = styled.div`
  width: 100%;
  max-width: 28rem;
  background: rgba(255, 255, 255, 0.1);
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
    transform: translateY(-4px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const HeaderSection = styled.div`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  }
`;

const HeaderTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  position: relative;
  z-index: 1;
`;

const HeaderSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  position: relative;
  z-index: 1;
`;

const FormContainer = styled.form`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
`;

const Input = styled.input<{ $hasError: boolean }>`
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

const ErrorMessage = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #fca5a5;
  font-weight: 500;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: #6366f1;
  border-radius: 4px;
`;

const CheckboxLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
`;

const ForgotLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: white;
  }
`;

const SubmitButton = styled.button<{ $isSubmitting: boolean }>`
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

const FooterSection = styled.div`
  padding: 2rem 2rem 2.5rem 2rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0;
`;

const SignUpLink = styled.a`
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  
  &:hover {
    color: #8b5cf6;
  }
`;

const SocialLoginSection = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SocialText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
`;

const SocialButton = styled.button`
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

const CloseButton = styled.button`
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

const LoginForm = () => {
    const { login, isLoading, error, clearError } = useAuth();
    
    const [formData, setFormData] = useState<FormData>({
        email: 'alice@example.com',
        password: 'password123',
        rememberMe: false
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // 清除API错误
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [error, clearError]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 清除对应字段的错误
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: FormErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email address is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (validate()) {
            try {
                await login(formData.email, formData.password);
                // 登录成功后的处理由App组件自动处理
            } catch (error) {
                // 错误处理在auth store中完成
                console.error('Login error:', error);
            }
        }
    };

    const handleClose = () => {
        Window.getCurrent().close();
    };

    return (
        <LoginContainer>
            <CloseButton onClick={handleClose} title="Close">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
              </svg>
            </CloseButton>
            <LoginCard>
                <HeaderSection>
                    <HeaderTitle>Welcome Back</HeaderTitle>
                    <HeaderSubtitle>Sign in to your account</HeaderSubtitle>
                </HeaderSection>

                <FormContainer onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="email">Email Address</Label>
                        <InputWrapper>
                            <InputIcon>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </InputIcon>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                $hasError={!!errors.email}
                            />
                        </InputWrapper>
                        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="password">Password</Label>
                        <InputWrapper>
                            <InputIcon>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </InputIcon>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                $hasError={!!errors.password}
                            />
                        </InputWrapper>
                        {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                    </FormGroup>

                    <CheckboxRow>
                        <CheckboxGroup>
                            <Checkbox
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <CheckboxLabel htmlFor="rememberMe">Remember me</CheckboxLabel>
                        </CheckboxGroup>
                        <ForgotLink href="#">Forgot password?</ForgotLink>
                    </CheckboxRow>

                    <SubmitButton type="submit" $isSubmitting={isLoading} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : 'Sign in'}
                    </SubmitButton>
                </FormContainer>

                <FooterSection>
                    <FooterText>
                        Don't have an account?{' '}
                        <SignUpLink href="#">Sign up</SignUpLink>
                    </FooterText>
                    <SocialLoginSection>
                        <SocialText>Or continue with</SocialText>
                        <SocialButtons>
                            <SocialButton>
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                                </svg>
                            </SocialButton>
                            <SocialButton>
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                                </svg>
                            </SocialButton>
                            <SocialButton>
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </SocialButton>
                        </SocialButtons>
                    </SocialLoginSection>
                </FooterSection>
            </LoginCard>
        </LoginContainer>
    );
};

export default LoginForm;
