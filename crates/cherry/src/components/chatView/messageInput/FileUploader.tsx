import React, { useCallback } from 'react';
import styled from 'styled-components';
import { dialogService } from '@/services/dialogService';
import { FileInfo } from '@/services/dialogService/types';

// Types
interface FileUploaderProps {
  onFileSelect: (fileInfo: FileInfo) => void;
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
const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  disabled = false
}) => {
  // 选择文件，获取真实路径及文件信息
  const handleSelectFile = useCallback(async () => {
    try {
      const fileInfo = await dialogService.openFileDialog();
      if (fileInfo) {
        onFileSelect(fileInfo);
      }
    } catch (error) {
      console.error('选择文件失败:', error);
    }
  }, [onFileSelect]);

  return (
    <UploadButton
      onClick={handleSelectFile}
      disabled={disabled}
      title="发送文件"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    </UploadButton>
  );
};

export default FileUploader;
