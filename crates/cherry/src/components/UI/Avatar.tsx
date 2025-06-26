import React from 'react';
import type { Contact } from '../../types/contact';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  status?: Contact['status'];
}

const statusColors: { [key: string]: string } = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-500'
};

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  status 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className="relative inline-block">
      <img 
        className={`${sizeClasses[size]} rounded-full object-cover border border-gray-200`}
        src={src} 
        alt={alt} 
      />
      {status && (
        <span 
          className={`absolute bottom-0 right-0 block rounded-full border-2 border-white ${statusColors[status]}`}
          style={{ width: '10px', height: '10px' }}
        />
      )}
    </div>
  );
};

export default Avatar;
