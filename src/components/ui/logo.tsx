import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-40 h-25',
    md: 'w-60 h-35',
    lg: 'w-80 h-45'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/brightbrown_logo.png" 
        alt="Brightbrown M.A.A.S." 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}

export default Logo; 