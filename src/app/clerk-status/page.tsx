'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ClerkStatusPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span>Laden van Clerk status...</span>
        </div>
      </div>
    );
  }

  const primaryEmail = user?.emailAddresses.find(ea => ea.id === user.primaryEmailAddressId)?.emailAddress;
  const isDomainValid = primaryEmail ? primaryEmail.endsWith('@fitchannel.com') : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Clerk Status Dashboard</h1>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              {isLoaded ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
              )}
              Clerk Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {isLoaded ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Client Loaded: {isLoaded ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {isSignedIn ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>User Signed In: {isSignedIn ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        {isSignedIn && user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.fullName || 'N/A'}</p>
              <p><strong>Primary Email:</strong> {primaryEmail || 'N/A'}</p>
              <p><strong>Email Verified:</strong> {user.emailAddresses[0]?.verification?.status === 'verified' ? 'Yes' : 'No'}</p>
              <p><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
            </CardContent>
          </Card>
        )}

        {/* Email Domain Validation */}
        {isSignedIn && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                {isDomainValid ? (
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                )}
                Email Domain Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {isDomainValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={isDomainValid ? 'text-green-700' : 'text-red-700'}>
                  {isDomainValid 
                    ? 'Email domain is valid (@fitchannel.com)' 
                    : `Email domain is invalid. Expected @fitchannel.com, got ${primaryEmail ? primaryEmail.split('@')[1] : 'unknown'}`
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environment Variables Check */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Publishable Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {process.env.CLERK_SECRET_KEY ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Secret Key: {process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          {isSignedIn ? (
            <>
              <Button onClick={() => signOut()}>
                Sign Out
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </>
          ) : (
            <Link href="/auth">
              <Button>Sign In / Sign Up</Button>
            </Link>
          )}
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
