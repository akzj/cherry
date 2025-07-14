
// src/components/AsyncMessageImage.tsx
import { fileService } from '@/services/fileService';
import React, { useState, useEffect } from 'react';

const AsyncMessageImage: React.FC<{ url: string }> = ({ url }) => {
  const [src, setSrc] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // 只需调用 downloadFile，内部自动处理缓存和下载
        const filePath = await fileService.downloadFile(url);
        // 转换为可访问的 URL（适配环境的协议）
        const imageUrl = fileService.toAccessibleUrl(filePath);

        console.log('加载图片:', imageUrl);
        // 设置图片源 
        // 注意：如果是 blob URL，可能需要转换为 object URL

        if (mounted) {
          setSrc(imageUrl);
        }
      } catch (err) {
        console.error('加载图片失败:', err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadImage();
    return () => { mounted = false; };
  }, [url]);

  if (isLoading) {
    return (
      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        图片加载中...
      </div>
    );
  }

  if (error || !src) {
    return (
      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        图片加载失败
      </div>
    );
  }

  return (
    <img
      src={src}
      style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', margin: '4px 0' }}
      alt="消息图片"
    />
  );
};

export default AsyncMessageImage;