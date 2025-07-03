import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { invoke } from '@tauri-apps/api/core';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onUploadComplete: (imageUrl: string, thumbnailUrl: string, metadata: any) => void;
  conversationId: string;
  disabled?: boolean;
}

interface UploadProgress {
  imageId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

const Container = styled.div`
  position: relative;
`;

const UploadButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  
  &:hover:not(:disabled) {
    background: rgba(107, 114, 128, 0.1);
    color: #374151;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PreviewContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 60vh;
  border-radius: 8px;
`;

const PreviewActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  `}
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$progress}%;
    background: #3b82f6;
    transition: width 0.3s ease;
  }
`;

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onUploadComplete,
  conversationId,
  disabled = false
}) => {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
      alert('图片文件大小不能超过10MB');
      return;
    }

    setPreviewFile(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const uploadImage = async (file: File): Promise<void> => {
    try {
      // 1. 获取上传URL
      const uploadRequest = {
        conversation_id: conversationId,
        filename: file.name,
        mime_type: file.type,
        size: file.size
      };

      const uploadResponse = await invoke('upload_image', { request: uploadRequest });
      const { upload_url, file_id, expires_at } = uploadResponse as any;

      setUploadProgress({
        imageId: file_id,
        progress: 0,
        status: 'uploading'
      });

      // 2. 上传文件
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => prev ? { ...prev, progress } : null);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          setUploadProgress(prev => prev ? { ...prev, status: 'processing' } : null);
          
          // 3. 计算文件校验和
          const arrayBuffer = await file.arrayBuffer();
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          // 4. 获取图片元数据
          const metadata = await getImageMetadata(file);

          // 5. 完成上传
          const completeRequest = {
            file_id,
            checksum,
            metadata
          };

          const completeResponse = await invoke('complete_image_upload', { request: completeRequest });
          const { image_url, thumbnail_url } = completeResponse as any;

          setUploadProgress(prev => prev ? { ...prev, status: 'complete' } : null);
          
          // 6. 调用回调
          onUploadComplete(image_url, thumbnail_url, metadata);
          
          // 清理状态
          setTimeout(() => {
            setUploadProgress(null);
            setPreviewFile(null);
          }, 1000);
        } else {
          setUploadProgress(prev => prev ? { 
            ...prev, 
            status: 'error', 
            error: '上传失败' 
          } : null);
        }
      });

      xhr.addEventListener('error', () => {
        setUploadProgress(prev => prev ? { 
          ...prev, 
          status: 'error', 
          error: '网络错误' 
        } : null);
      });

      xhr.open('POST', upload_url);
      xhr.send(formData);

    } catch (error) {
      console.error('上传图片失败:', error);
      setUploadProgress(prev => prev ? { 
        ...prev, 
        status: 'error', 
        error: '上传失败' 
      } : null);
    }
  };

  const getImageMetadata = (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          mime_type: file.type,
          filename: file.name,
          checksum: '' // 将在上传时计算
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: 0,
          height: 0,
          size: file.size,
          format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          mime_type: file.type,
          filename: file.name,
          checksum: ''
        });
      };
      
      img.src = url;
    });
  };

  const handleSendImage = async () => {
    if (previewFile) {
      await uploadImage(previewFile);
    }
  };

  const handleCancel = () => {
    setPreviewFile(null);
    setUploadProgress(null);
  };

  return (
    <Container onDrop={handleDrop} onDragOver={handleDragOver}>
      <UploadButton
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        title="发送图片"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </UploadButton>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
      />

      {previewFile && (
        <PreviewContainer>
          <PreviewContent>
            <PreviewImage src={URL.createObjectURL(previewFile)} alt="预览" />
            
            {uploadProgress && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {uploadProgress.status === 'uploading' && '上传中...'}
                  {uploadProgress.status === 'processing' && '处理中...'}
                  {uploadProgress.status === 'complete' && '上传完成'}
                  {uploadProgress.status === 'error' && `上传失败: ${uploadProgress.error}`}
                </div>
                {uploadProgress.status === 'uploading' && (
                  <ProgressBar $progress={uploadProgress.progress} />
                )}
              </div>
            )}

            <PreviewActions>
              <ActionButton onClick={handleCancel}>
                取消
              </ActionButton>
              <ActionButton 
                $variant="primary" 
                onClick={handleSendImage}
                disabled={uploadProgress?.status === 'uploading' || uploadProgress?.status === 'processing'}
              >
                发送
              </ActionButton>
            </PreviewActions>
          </PreviewContent>
        </PreviewContainer>
      )}
    </Container>
  );
};

export default ImageUploader; 