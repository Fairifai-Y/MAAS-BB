'use client';

import { useState, useEffect } from 'react';
import { isValidEmailDomain } from '@/lib/auth-utils';

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  isLoaded: boolean;
  signOut: () => void;
}

// Mock auth context for testing without Clerk
export const useMockAuth = (): MockAuthContextType => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if there's a mock user in localStorage
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }
    setIsLoaded(true);
  }, []);

  const signOut = () => {
    localStorage.removeItem('mockUser');
    setUser(null);
  };

  return { user, isLoaded, signOut };
};

// Mock sign in function
export const mockSignIn = (email: string, name: string) => {
  if (!isValidEmailDomain(email)) {
    throw new Error('Alleen @fitchannel.com email adressen zijn toegestaan');
  }

  const mockUser: MockUser = {
    id: 'mock_' + Date.now(),
    email,
    name,
    role: 'CUSTOMER'
  };

  localStorage.setItem('mockUser', JSON.stringify(mockUser));
  return mockUser;
};
