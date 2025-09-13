'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [clerkError, setClerkError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for Clerk errors
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('unexpected response') || 
          event.error?.message?.includes('Clerk')) {
        console.error('🚨 Clerk error detected:', event.error);
        setClerkError('Er is een probleem opgetreden met de authenticatie. Je wordt doorgestuurd...');
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/post-auth';
        }, 2000);
      }
    };

    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('unexpected response') || 
          event.reason?.message?.includes('Clerk')) {
        console.error('🚨 Clerk promise rejection detected:', event.reason);
        setClerkError('Er is een probleem opgetreden met de authenticatie. Je wordt doorgestuurd...');
        
        // Prevent the default error handling
        event.preventDefault();
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/post-auth';
        }, 2000);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header removed per request */}

        {/* Clerk Error Notice */}
        {clerkError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-800 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Authenticatie Fout
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-red-700 mb-3">
                {clerkError}
              </p>
              <p className="text-xs text-red-600">
                Je wordt automatisch doorgestuurd naar de login pagina...
              </p>
            </CardContent>
          </Card>
        )}


        {/* Auth Toggle */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <Button
                variant={isSignIn ? "default" : "ghost"}
                onClick={() => setIsSignIn(true)}
                className="flex-1"
              >
                Inloggen
              </Button>
              <Button
                variant={!isSignIn ? "default" : "ghost"}
                onClick={() => setIsSignIn(false)}
                className="flex-1"
              >
                Registreren
              </Button>
            </div>

            {/* Clerk Components */}
            {isSignIn ? (
              <SignIn 
                fallbackRedirectUrl="/post-auth"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                    formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                    footerActionLink: 'text-blue-600 hover:text-blue-700',
                    formButtonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
                    identityPreviewText: 'text-gray-600',
                    formFieldLabel: 'text-gray-700',
                    formFieldSuccessText: 'text-green-600',
                    formFieldErrorText: 'text-red-600'
                  }
                }}
              />
            ) : (
              <SignUp 
                fallbackRedirectUrl="/post-auth"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                    formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                    footerActionLink: 'text-blue-600 hover:text-blue-700',
                    formButtonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
                    identityPreviewText: 'text-gray-600',
                    formFieldLabel: 'text-gray-700',
                    formFieldSuccessText: 'text-green-600',
                    formFieldErrorText: 'text-red-600'
                  }
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Veilige Toegang</h3>
                <p className="text-sm text-green-700 mt-1">
                  Beveiligde authenticatie voor Fitchannel medewerkers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
