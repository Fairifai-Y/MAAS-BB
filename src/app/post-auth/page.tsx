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
    const syncUser = async (retryCount = 0) => {
      if (isSyncing) return;
      
      setIsSyncing(true);
      try {
        console.log(`🔄 Syncing user (attempt ${retryCount + 1})...`);
        
        const response = await fetch('/api/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ User synced successfully:', data);
          
          // Redirect based on userType (preferred) or role (fallback)
          const userType = data.user.userType || data.user.role;
          
          if (userType === 'ADMIN') {
            router.replace('/admin');
          } else if (userType === 'EMPLOYEE') {
            router.replace('/dashboard');
          } else {
            // CUSTOMER - redirect to customer portal or dashboard
            router.replace('/dashboard');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Failed to sync user:', errorData);
          
          // Retry up to 3 times with exponential backoff
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(`⏳ Retrying in ${delay}ms...`);
            setTimeout(() => {
              syncUser(retryCount + 1);
            }, delay);
            return;
          }
          
          // After 3 retries, fallback to dashboard
          console.log('⚠️ Max retries reached, redirecting to dashboard');
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('❌ Error syncing user:', error);
        
        // Retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`⏳ Retrying in ${delay}ms...`);
          setTimeout(() => {
            syncUser(retryCount + 1);
          }, delay);
          return;
        }
        
        // After 3 retries, fallback to dashboard
        console.log('⚠️ Max retries reached, redirecting to dashboard');
        router.replace('/dashboard');
      } finally {
        if (retryCount === 0) {
          setIsSyncing(false);
        }
      }
    };

    // Add a small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      syncUser();
    }, 500); // Increased delay to give webhook more time

    return () => clearTimeout(timeoutId);
  }, [isLoaded, isSignedIn, user?.id, router]);

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


