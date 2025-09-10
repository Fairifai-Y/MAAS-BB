'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function PostAuthRedirect() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace('/auth');
      return;
    }

    // Sync user with database
    const syncUser = async () => {
      if (isSyncing) return;
      
      setIsSyncing(true);
      try {
        const response = await fetch('/api/sync-user', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('User synced:', data);
          
          // Redirect based on role
          if (data.user.role === 'ADMIN') {
            router.replace('/admin');
          } else {
            router.replace('/dashboard');
          }
        } else {
          console.error('Failed to sync user');
          // Fallback to dashboard
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Error syncing user:', error);
        // Fallback to dashboard
        router.replace('/dashboard');
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, router, isSyncing]);

  if (isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Synchroniseren...</p>
        </div>
      </div>
    );
  }

  return null;
}


