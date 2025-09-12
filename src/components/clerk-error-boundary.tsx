'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClerkErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ClerkErrorBoundary({ children }: ClerkErrorBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    // Global error handler for Clerk errors
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Global error caught:', event.error);
      
      // Check if it's a Clerk-related error
      if (event.error?.message?.includes('unexpected response') || 
          event.error?.message?.includes('Clerk') ||
          event.error?.stack?.includes('clerk')) {
        console.log('🔄 Clerk error detected, redirecting to post-auth...');
        
        // Redirect to post-auth page as fallback
        setTimeout(() => {
          router.push('/post-auth');
        }, 1000);
      }
    };

    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      
      // Check if it's a Clerk-related error
      if (event.reason?.message?.includes('unexpected response') || 
          event.reason?.message?.includes('Clerk') ||
          event.reason?.stack?.includes('clerk')) {
        console.log('🔄 Clerk promise rejection detected, redirecting to post-auth...');
        
        // Redirect to post-auth page as fallback
        setTimeout(() => {
          router.push('/post-auth');
        }, 1000);
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router]);

  return <>{children}</>;
}
