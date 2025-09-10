'use client';

import { useMockAuth } from '@/components/mock-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isValidEmailDomain } from '@/lib/auth-utils';

interface MockEmailDomainGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function MockEmailDomainGuard({ 
  children, 
  redirectTo = '/unauthorized' 
}: MockEmailDomainGuardProps) {
  const { user, isLoaded } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.email;
      
      if (email && !isValidEmailDomain(email)) {
        console.log('Email domain validation failed:', email);
        router.push(redirectTo);
      }
    }
  }, [user, isLoaded, router, redirectTo]);

  // Show loading state while checking
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Controleren toegang...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show auth prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Toegang Vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om deze pagina te bekijken.</p>
          <button 
            onClick={() => router.push('/auth-mock')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Inloggen
          </button>
        </div>
      </div>
    );
  }

  // Check email domain
  const email = user.email;
  if (email && !isValidEmailDomain(email)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Toegang Geweigerd</h2>
          <p className="text-gray-600 mb-2">Alleen @fitchannel.com email adressen zijn toegestaan.</p>
          <p className="text-sm text-gray-500 mb-6">Uw email: {email}</p>
          <button 
            onClick={() => router.push('/auth-mock')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Opnieuw Inloggen
          </button>
        </div>
      </div>
    );
  }

  // If all checks pass, render children
  return <>{children}</>;
}
