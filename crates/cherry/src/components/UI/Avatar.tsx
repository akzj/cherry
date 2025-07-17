import React, { useState, useCallback, useMemo } from 'react';
import clsx from 'clsx'; 

// 定义 status 的联合类型，确保类型安全
type Status = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  status?: Status;
  lazy?: boolean;
}

// 图片缓存
const imageCache = new Map<string, { loaded: boolean; error: boolean }>();

// 可维护的类名映射
const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

// 状态颜色映射
const statusColors: Record<Status, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  status,
  lazy = true
}) => {
  const [imageState, setImageState] = useState(() => {
    const cached = imageCache.get(src);
    return {
      loaded: cached?.loaded || false,
      error: cached?.error || false,
      loading: !cached?.loaded && !cached?.error
    };
  });

  const handleImageLoad = useCallback(() => {
    imageCache.set(src, { loaded: true, error: false });
    setImageState({ loaded: true, error: false, loading: false });
  }, [src]);

  const handleImageError = useCallback(() => {
    imageCache.set(src, { loaded: false, error: true });
    setImageState({ loaded: false, error: true, loading: false });
  }, [src]);

  const statusColor = status ? statusColors[status] : 'bg-gray-500'; // 默认颜色

  // 生成默认头像的简单方案
  const defaultAvatar = useMemo(() => {
    const firstChar = alt.charAt(0).toUpperCase() || '?';
    return (
      <div 
        className={clsx(
          sizeClasses[size],
          'rounded-full bg-gray-400 flex items-center justify-center text-white font-medium'
        )}
        style={{ 
          backgroundColor: `hsl(${alt.charCodeAt(0) * 7 % 360}, 50%, 50%)` 
        }}
      >
        {firstChar}
      </div>
    );
  }, [alt, size]);

  return (
    <div className="relative inline-block" role="img" aria-label={alt}>
      {imageState.error || !src ? (
        defaultAvatar
      ) : (
        <img 
          className={clsx(
            sizeClasses[size],
            'rounded-full object-cover border border-gray-200',
            imageState.loading && 'opacity-50'
          )}
          src={src} 
          alt={alt} 
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
      {status && (
        <span 
          className={clsx(
            statusColor,
            'absolute bottom-0 right-0 block rounded-full border-2 border-white'
          )}
          style={{ width: '10px', height: '10px' }}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default Avatar;