import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const FileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 300px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

export const FileIcon = styled.div<{ $fileType: string }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: ${props => {
    switch (props.$fileType) {
      case 'pdf': return '#FF6B6B';
      case 'doc': case 'docx': return '#4ECDC4';
      case 'xls': case 'xlsx': return '#45B7D1';
      case 'ppt': case 'pptx': return '#FFA07A';
      case 'txt': return '#98D8C8';
      case 'zip': case 'rar': case '7z': return '#F7DC6F';
      case 'mp3': case 'wav': case 'ogg': return '#BB8FCE';
      case 'mp4': case 'avi': case 'mov': return '#85C1E9';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '#82E0AA';
      default: return '#AED6F1';
    }
  }};
  
  & > svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;

export const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const FileSize = styled.div`
  font-size: 12px;
  color: #b0b0b0;
`;

export const DownloadIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b0b0b0;
  transition: color 0.2s;

  ${FileContainer}:hover & {
    color: #ffe100fb;
  }

  svg {
    width: 16px;
    height: 16px;
    
    &.animate-spin {
      animation: ${spin} 1.5s linear infinite;
    }
  }
`;
