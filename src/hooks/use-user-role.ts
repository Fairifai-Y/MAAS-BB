'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useUserRole() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded || !user) {
        setIsLoadingRole(false);
        return;
      }

      try {
        const response = await fetch('/api/user/role', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
        } else {
          console.error('Failed to fetch user role:', response.status);
          setRole(null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setIsLoadingRole(false);
      }
    }

    fetchUserRole();
  }, [user, isLoaded]);

  return {
    role,
    isLoadingRole,
    isAdmin: role === 'ADMIN',
    isEmployee: role === 'EMPLOYEE',
    isCustomer: role === 'CUSTOMER'
  };
}
