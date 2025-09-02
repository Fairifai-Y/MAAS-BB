import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-96 h-24',
    md: 'w-120 h-30',
    lg: 'w-144 h-36'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo_fitchannel.png" 
        alt="Fitchannel" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}

export default Logo; 