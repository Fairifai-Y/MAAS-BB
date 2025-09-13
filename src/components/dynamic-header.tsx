'use client';

import { Button } from '@/components/ui/button';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function DynamicHeader() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo_fitchannel.png"
                alt="Fitchannel Logo"
                width={200}
                height={64}
                className="h-16 w-auto cursor-pointer object-contain"
              />
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isLoaded ? (
              // Loading state
              <div className="flex space-x-3">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isSignedIn ? (
              // Signed in state
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            ) : (
              // Not signed in state
              <div className="flex space-x-3">
                <Link href="/auth">
                  <Button variant="outline" size="sm">Inloggen</Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">Registreren</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
