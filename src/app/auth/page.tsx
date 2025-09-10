'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MAAS Platform</h1>
          <p className="text-gray-600">Alleen voor Fitchannel medewerkers</p>
        </div>

        {/* Domain Restriction Notice */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-amber-800 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Toegang Beperkt
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-amber-700">
              Alleen @fitchannel.com email adressen hebben toegang tot dit platform.
            </p>
          </CardContent>
        </Card>

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
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                    formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                    footerActionLink: 'text-blue-600 hover:text-blue-700'
                  }
                }}
                signInForceRedirectUrl="/dashboard"
                signInFallbackRedirectUrl="/dashboard"
              />
            ) : (
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                    formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                    footerActionLink: 'text-blue-600 hover:text-blue-700'
                  }
                }}
                signUpForceRedirectUrl="/dashboard"
                signUpFallbackRedirectUrl="/dashboard"
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
                  Deze applicatie gebruikt beveiligde authenticatie en is alleen toegankelijk 
                  voor geautoriseerde Fitchannel medewerkers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
