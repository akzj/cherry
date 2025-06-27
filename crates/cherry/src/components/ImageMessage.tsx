import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

interface ImageMessageProps {
  imageUrl: string;
  thumbnailUrl?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    filename: string;
  };
  isOwnMessage?: boolean;
  timestamp: string;
  onImageClick?: (imageUrl: string) => void;
}

const Container = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  margin: 0.5rem 0;
  max-width: 60%;
`;

const ImageContainer = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.02);
  }
`;

const Image = styled.img<{ $loading: boolean }>`
  max-width: 300px;
  max-height: 300px;
  min-width: 100px;
  min-height: 100px;
  object-fit: cover;
  display: ${props => props.$loading ? 'none' : 'block'};
`;

const Thumbnail = styled.img<{ $loading: boolean }>`
  max-width: 300px;
  max-height: 300px;
  min-width: 100px;
  min-height: 100px;
  object-fit: cover;
  display: ${props => props.$loading ? 'block' : 'none'};
  filter: blur(2px);
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 150px;
  background: #f3f4f6;
  border-radius: 12px;
  color: #6b7280;
  font-size: 0.875rem;
`;

const Metadata = styled.div`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
`;

const Timestamp = styled.div`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
`;

const FullscreenImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
`;

const FullscreenClose = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const ImageMessage: React.FC<ImageMessageProps> = ({
  imageUrl,
  thumbnailUrl,
  metadata,
  isOwnMessage = false,
  timestamp,
  onImageClick
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleImageClick = useCallback(() => {
    if (onImageClick) {
      onImageClick(imageUrl);
    } else {
      setIsFullscreen(true);
    }
  }, [imageUrl, onImageClick]);

  const handleFullscreenClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(false);
  }, []);

  const handleFullscreenClick = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  return (
    <>
      <Container $isOwn={isOwnMessage}>
        <ImageContainer onClick={handleImageClick}>
          {isLoading && <LoadingSpinner />}
          
          {thumbnailUrl && (
            <Thumbnail
              src={thumbnailUrl}
              alt="缩略图"
              $loading={isLoading}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          <Image
            src={imageUrl}
            alt={metadata?.filename || '图片'}
            $loading={isLoading}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {hasError && (
            <ErrorContainer>
              图片加载失败
            </ErrorContainer>
          )}
        </ImageContainer>
        
        {metadata && (
          <Metadata>
            {metadata.filename} • {formatFileSize(metadata.size)}
            {metadata.width > 0 && metadata.height > 0 && 
              ` • ${metadata.width}×${metadata.height}`
            }
          </Metadata>
        )}
        
        <Timestamp>{timestamp}</Timestamp>
      </Container>

      {isFullscreen && (
        <FullscreenOverlay onClick={handleFullscreenClick}>
          <FullscreenClose onClick={handleFullscreenClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </FullscreenClose>
          <FullscreenImage
            src={imageUrl}
            alt={metadata?.filename || '图片'}
            onClick={(e) => e.stopPropagation()}
          />
        </FullscreenOverlay>
      )}
    </>
  );
};

export default ImageMessage; 