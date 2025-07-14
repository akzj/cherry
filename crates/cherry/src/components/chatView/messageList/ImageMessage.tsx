import React, { useState, useCallback } from 'react';

import {
  Container,
  ErrorContainer,
  FullscreenClose,
  FullscreenImage,
  FullscreenOverlay,
  Image,
  ImageContainer,
  LoadingSpinner,
  Metadata,
  Thumbnail

} from './ImageMessage.styled'
import { Timestamp } from './MessageItem.styled';

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