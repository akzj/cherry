import styled from "styled-components";

export const Container = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  margin: 0.5rem 0;
  max-width: 60%;
`;

export const ImageContainer = styled.div`
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

export const Image = styled.img<{ $loading: boolean }>`
  max-width: 240px;
  max-height: 160px;
  min-width: 100px;
  min-height: 100px;
  object-fit: cover;
  display: ${props => props.$loading ? 'none' : 'block'};
`;

export const Thumbnail = styled.img<{ $loading: boolean }>`
  max-width: 240px;
  max-height: 160px;
  min-width: 100px;
  min-height: 100px;
  object-fit: cover;
  display: ${props => props.$loading ? 'block' : 'none'};
  filter: blur(2px);
`;

export const LoadingSpinner = styled.div`
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

export const ErrorContainer = styled.div`
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

export const Metadata = styled.div`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
`;

export const Timestamp = styled.div`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
`;

export const FullscreenOverlay = styled.div`
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

export const FullscreenImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
`;

export const FullscreenClose = styled.button`
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
