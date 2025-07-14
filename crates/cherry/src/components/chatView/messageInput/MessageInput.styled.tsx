import styled from 'styled-components';

// ==================== Styled Components ====================
export const Container = styled.div`
  position: relative;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

export const Form = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  position: relative;
`;

export const InputContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  min-height: 48px;
  
  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: #ffffff;
  }
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;

export const InputField = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #111827;
  font-size: 0.95rem;
  line-height: 1.4;
  resize: none;
  min-height: 25px;
  max-height: 120px;
  font-family: inherit;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ImageThumbnailContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

export const ImageThumbnail = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

export const ImageInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const ImageName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

export const ImageSize = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

export const RemoveImageButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

export const RightButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  
  &:hover:not(:disabled) {
    background: rgba(107, 114, 128, 0.1);
    color: #374151;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const SendButton = styled.button<{ $disabled: boolean; $hasContent: boolean }>`
  background: ${props => props.$hasContent
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    : 'none'
  };
  border: none;
  color: ${props => props.$hasContent ? '#ffffff' : '#6b7280'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-left: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: ${props => props.$hasContent ? 'scale(1.05)' : 'none'};
    background: ${props => props.$hasContent
    ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
    : 'rgba(107, 114, 128, 0.1)'
  };
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;