// src/components/AsyncMessageImage.tsx
import { fileService } from '@/services/fileService';
import React, { useState, useEffect } from 'react';

export interface AsyncMessageImageProps {
  url: string;
  width?: number;
  height?: number;
}

const AsyncMessageImage: React.FC<AsyncMessageImageProps> = ({
  url,
  width,
  height,
}) => {
  const [src, setSrc] = useState<string>();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  //console.log('AsyncMessageImage: url', url, 'width', width, 'height', height);
  /* ---------- 异步下载 ---------- */
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        // 如需真实网络延迟可保留，否则删掉
        const path = await fileService.downloadFile(url);
        const imgUrl = fileService.toAccessibleUrl(path);
        if (alive) setSrc(imgUrl);
      } catch {
        if (alive) setError(true);
      }
    };
    load();
    return () => { alive = false; };
  }, [url]);

  /* ---------- 计算容器尺寸 ---------- */
  const maxWidth = width && width > 400 ? 400 : width || 220; // px
  const finalHeight = width && height
    ? Math.round((maxWidth / width) * height)
    : 120; // 兜底高度

  /* ---------- 占位框 ---------- */
  const skeleton = (
    <div
      style={{
        width: maxWidth,
        height: finalHeight,
        background: '#f2f2f2',
        borderRadius: 8,
      }}
    />
  );

  /* ---------- 错误态 ---------- */
  if (error) {
    return (
      <div
        style={{
          width: maxWidth,
          height: finalHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f56c6c',
          fontSize: 12,
          background: '#f2f2f2',
          borderRadius: 8,
        }}
      >
        图片加载失败
      </div>
    );
  }

  /* ---------- 渲染 ---------- */
  return (
    <div
      style={{
        position: 'relative',
        width: maxWidth,
        height: finalHeight,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* 占位骨架始终存在 */}
      {skeleton}

      {/* 真实图片淡入覆盖 */}
      {src && (
        <img
          src={src}
          alt="消息图片"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 8,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 200ms',
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

export default AsyncMessageImage;