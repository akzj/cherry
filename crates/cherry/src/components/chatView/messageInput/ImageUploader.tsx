import React, { useCallback } from 'react';
import styled from 'styled-components';
import { dialogService } from '@/services/dialogService';
import { FileInfo } from '@/services/dialogService/types';

// Types
interface ImageUploaderProps {
  onImageSelect: (fileInfo: FileInfo) => void;
  disabled?: boolean;
}

// Styled Components
const UploadButton = styled.button`
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
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// Main component
const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  disabled = false
}) => {
  // 选择图片，获取真实路径及图片信息
  const handleSelectImage = useCallback(async () => {
    try {
      const fileInfo = await dialogService.openImageDialog();
      if (fileInfo) {
        onImageSelect(fileInfo);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
    }
  }, [onImageSelect]);

  return (
    <UploadButton
      onClick={handleSelectImage}
      disabled={disabled}
      title="发送图片"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </UploadButton>
  );
};

export default ImageUploader;