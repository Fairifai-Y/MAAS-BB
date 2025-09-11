'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidEmailDomain, getAllowedEmailDomains } from '@/lib/auth-utils';

interface EmployeeGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function EmployeeGuard({ 
  children, 
  redirectTo = '/unauthorized' 
}: EmployeeGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      
      // First check email domain
      if (email && !isValidEmailDomain(email)) {
        console.log('Email domain validation failed:', email);
        router.push(redirectTo);
        return;
      }

      // Then check user role
      const checkUserRole = async () => {
        try {
          const response = await fetch('/api/sync-user', {
            method: 'POST',
          });

          if (response.ok) {
            const data = await response.json();
            setUserRole(data.user.role);
            
            // If user is not employee or admin, redirect
            if (data.user.role !== 'EMPLOYEE' && data.user.role !== 'ADMIN') {
              console.log('User is not employee or admin, redirecting to unauthorized');
              router.push('/unauthorized');
              return;
            }
          } else {
            console.error('Failed to sync user');
            router.push('/unauthorized');
            return;
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          router.push('/unauthorized');
          return;
        } finally {
          setIsCheckingRole(false);
        }
      };

      checkUserRole();
    } else if (isLoaded && !user) {
      // User is not authenticated
      router.push('/auth');
    }
  }, [user, isLoaded, router, redirectTo]);

  // Show loading state while checking
  if (!isLoaded || isCheckingRole) {
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
            onClick={() => router.push('/auth')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Inloggen
          </button>
        </div>
      </div>
    );
  }

  // Check email domain
  const email = user.primaryEmailAddress?.emailAddress;
  if (email && !isValidEmailDomain(email)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Toegang Geweigerd</h2>
          <p className="text-gray-600 mb-2">Alleen email adressen van de volgende domeinen zijn toegestaan: {getAllowedEmailDomains().join(', ')}</p>
          <p className="text-sm text-gray-500 mb-6">Uw email: {email}</p>
          <button 
            onClick={() => router.push('/auth')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Opnieuw Inloggen
          </button>
        </div>
      </div>
    );
  }

  // Check if user is employee or admin
  if (userRole && userRole !== 'EMPLOYEE' && userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Toegang Geweigerd</h2>
          <p className="text-gray-600 mb-2">Je hebt geen toegang tot het medewerker dashboard.</p>
          <p className="text-sm text-gray-500 mb-6">Uw rol: {userRole}</p>
          <button 
            onClick={() => router.push('/unauthorized')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Terug
          </button>
        </div>
      </div>
    );
  }

  // If all checks pass, render children
  return <>{children}</>;
}
