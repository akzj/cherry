import React, { useState } from 'react';
import { getFileSvg } from '@/components/UI/fileIcon';
import { fileService } from '@/services/fileService';
import {
  FileContainer,
  FileIcon,
  FileInfo,
  FileName,
  FileSize,
  DownloadIcon
} from './FileMessage.styled';

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

  const getMimeTypeFromFileType = (fileType: string): string => {
    switch (fileType) {
      case 'pdf': return 'application/pdf';
      case 'doc': case 'docx': return 'application/msword';
      case 'xls': case 'xlsx': return 'application/vnd.ms-excel';
      case 'ppt': case 'pptx': return 'application/vnd.ms-powerpoint';
      case 'txt': return 'text/plain';
      case 'html': case 'htm': return 'text/html';
      case 'zip': return 'application/zip';
      case 'rar': return 'application/x-rar-compressed';
      case '7z': return 'application/x-7z-compressed';
      case 'mp3': return 'audio/mpeg';
      case 'wav': return 'audio/wav';
      case 'ogg': return 'audio/ogg';
      case 'mp4': return 'video/mp4';
      case 'avi': return 'video/x-msvideo';
      case 'mov': return 'video/quicktime';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      default: return 'application/octet-stream';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // 使用 fileService 下载文件
      const downloadedPath = await fileService.downloadFile(fileUrl);
      
      // 根据不同平台处理下载后的文件
      if (downloadedPath.startsWith('blob:')) {
        // Web 平台 - 使用 blob URL
        const link = document.createElement('a');
        link.href = downloadedPath;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Tauri/Electron 平台 - 文件已经下载到本地，可以直接打开
        console.log('文件已下载到: ' + downloadedPath);
        // 可能需要使用特定平台 API 打开文件
      }
    } catch (error) {
      console.error('下载文件失败:', error);
      alert('下载文件失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const fileType = getFileType(filename, mimeType);
  const actualMimeType = mimeType || getMimeTypeFromFileType(fileType);
  const FileSvgComponent = getFileSvg(actualMimeType);

  return (
    <FileContainer onClick={handleDownload}>
      <FileIcon $fileType={fileType}>
        <FileSvgComponent />
      </FileIcon>
      <FileInfo>
        <FileName title={filename}>{filename}</FileName>
        <FileSize>{formatFileSize(fileSize)}</FileSize>
      </FileInfo>
      <DownloadIcon>
        {isDownloading ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="animate-spin">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3"/>
            <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 12V8l5.5 4-5.5 4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        )}
      </DownloadIcon>
    </FileContainer>
  );
};

export default FileMessage;
