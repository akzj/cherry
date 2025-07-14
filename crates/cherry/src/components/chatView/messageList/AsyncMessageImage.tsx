
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

        // 1. 获取缓存路径（通过抽象服务，而非直接调用 Tauri 的 path）
        const cacheDir = await fileService.getCacheDirPath();
        const cacheFilePath = `${cacheDir}/${url.split('/').pop()}`; // 简化的缓存路径生成

        // 2. 检查缓存是否存在（通过抽象服务）
        const cacheExists = await fileService.exists(cacheFilePath);

        // 3. 缓存存在则直接用，否则下载（通过抽象服务）
        const filePath = cacheExists 
          ? cacheFilePath 
          : await fileService.downloadFile(url, cacheFilePath);

        // 4. 转换为可访问的 URL（适配环境的协议）
        const imageUrl = fileService.toAccessibleUrl(filePath);

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