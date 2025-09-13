import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  linkToHome?: boolean;
}

export function Logo({ className = '', size = 'md', linkToHome = true }: LogoProps) {
  const sizeClasses = {
    sm: { width: 150, height: 48 },
    md: { width: 200, height: 64 },
    lg: { width: 250, height: 80 }
  };

  const logoElement = (
    <Image
      src="/logo_fitchannel.png"
      alt="Fitchannel Logo"
      width={sizeClasses[size].width}
      height={sizeClasses[size].height}
      className="h-16 w-auto object-contain"
    />
  );

  return (
    <div className={`flex items-center ${className}`}>
      {linkToHome ? (
        <Link href="/">
          {logoElement}
        </Link>
      ) : (
        logoElement
      )}
    </div>
  );
}

export default Logo; 