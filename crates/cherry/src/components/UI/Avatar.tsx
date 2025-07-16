import React from 'react';
import clsx from 'clsx'; 

// 定义 status 的联合类型，确保类型安全
type Status = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  status?: Status;
}

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
  status 
}) => {
  const statusColor = status ? statusColors[status] : 'bg-gray-500'; // 默认颜色

  return (
    <div className="relative inline-block" role="img" aria-label={alt}>
      <img 
        className={clsx(
          sizeClasses[size],
          'rounded-full object-cover border border-gray-200'
        )}
        src={src} 
        alt={alt} 
      />
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