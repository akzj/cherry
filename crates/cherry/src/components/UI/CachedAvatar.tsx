import React, { useMemo } from 'react';
import Avatar from './Avatar';

// Avatar 组件缓存池
const avatarCache = new Map<string, React.ReactElement>();

interface CachedAvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy' | 'away';
  lazy?: boolean;
}

/**
 * 带缓存的 Avatar 组件
 * 相同的 src + size + status 组合会返回缓存的组件实例
 */
const CachedAvatar: React.FC<CachedAvatarProps> = (props) => {
  const { src, alt, size = 'md', status, lazy = true } = props;
  
  // 生成缓存key
  const cacheKey = `${src}-${size}-${status || 'none'}-${lazy}`;
  
  const avatarElement = useMemo(() => {
    // 检查缓存
    const cached = avatarCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 创建新的 Avatar 组件
    const newAvatar = (
      <Avatar 
        src={src} 
        alt={alt} 
        size={size} 
        status={status}
        lazy={lazy}
      />
    );
    
    // 缓存组件（限制缓存大小）
    if (avatarCache.size > 100) {
      const firstKey = avatarCache.keys().next().value;
      if (firstKey) {
        avatarCache.delete(firstKey);
      }
    }
    
    avatarCache.set(cacheKey, newAvatar);
    return newAvatar;
  }, [cacheKey, src, alt, size, status, lazy]);
  
  return avatarElement;
};

export default CachedAvatar;
