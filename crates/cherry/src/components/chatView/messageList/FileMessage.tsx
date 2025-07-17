import React from 'react';
import styled from 'styled-components';

const FileContainer = styled.div`
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

const FileIcon = styled.div<{ $fileType: string }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: #b0b0b0;
`;

const DownloadIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b0b0b0;
  transition: color 0.2s;

  ${FileContainer}:hover & {
    color: #ffffff;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface FileMessageProps {
  fileUrl: string;
  filename: string;
  fileSize: number;
  mimeType?: string;
}

const FileMessage: React.FC<FileMessageProps> = ({ fileUrl, filename, fileSize, mimeType }) => {
  const getFileType = (filename: string, mimeType?: string): string => {
    if (mimeType) {
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
      if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'zip';
      if (mimeType.includes('audio')) return 'mp3';
      if (mimeType.includes('video')) return 'mp4';
      if (mimeType.includes('image')) return 'jpg';
      if (mimeType.includes('text')) return 'txt';
    }
    
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'file';
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'xls': case 'xlsx': return '📊';
      case 'ppt': case 'pptx': return '📋';
      case 'txt': return '📃';
      case 'zip': case 'rar': case '7z': return '📦';
      case 'mp3': case 'wav': case 'ogg': return '🎵';
      case 'mp4': case 'avi': case 'mov': return '🎬';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
      default: return '📎';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    // 创建临时链接进行下载
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileType = getFileType(filename, mimeType);

  return (
    <FileContainer onClick={handleDownload}>
      <FileIcon $fileType={fileType}>
        {getFileIcon(fileType)}
      </FileIcon>
      <FileInfo>
        <FileName title={filename}>{filename}</FileName>
        <FileSize>{formatFileSize(fileSize)}</FileSize>
      </FileInfo>
      <DownloadIcon>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </DownloadIcon>
    </FileContainer>
  );
};

export default FileMessage;
