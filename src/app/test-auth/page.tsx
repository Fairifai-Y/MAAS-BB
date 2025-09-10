'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  LogOut,
  Settings
} from 'lucide-react';
import { isValidEmailDomain } from '@/lib/auth-utils';
import Link from 'next/link';

export default function TestAuthPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useAuth();

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">Niet Ingelogd</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Je bent niet ingelogd. Log in om toegang te krijgen tot het platform.
            </p>
            <Link href="/auth">
              <Button className="w-full">Inloggen</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const email = user.primaryEmailAddress?.emailAddress || '';
  const isEmailValid = isValidEmailDomain(email);
  const userRole = user.publicMetadata?.role as string || 'CUSTOMER';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authenticatie Test</h1>
          <p className="text-gray-600">Test pagina voor Clerk authenticatie en email domein validatie</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Gebruikersinformatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{user.fullName || 'Geen naam'}</p>
                  <p className="text-sm text-gray-600">ID: {user.id}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Rol: {userRole}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Validatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Domein Validatie</span>
                <Badge 
                  variant={isEmailValid ? "default" : "destructive"}
                  className={isEmailValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {isEmailValid ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Geldig
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Ongeldig
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-1">Email adres:</p>
                <p className="font-mono text-sm">{email}</p>
              </div>
              
              {!isEmailValid && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Email niet toegestaan</p>
                      <p className="text-sm text-red-700">
                        Alleen @fitchannel.com email adressen zijn toegestaan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Sessie Informatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ingelogd sinds:</span>
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleString('nl-NL') : 'Onbekend'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Laatste update:</span>
                  <span>{user.updatedAt ? new Date(user.updatedAt).toLocaleString('nl-NL') : 'Onbekend'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email geverifieerd:</span>
                  <Badge variant={user.primaryEmailAddress?.verification?.status === 'verified' ? "default" : "secondary"}>
                    {user.primaryEmailAddress?.verification?.status === 'verified' ? 'Ja' : 'Nee'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard" className="block">
                <Button className="w-full">Ga naar Dashboard</Button>
              </Link>
              
              <Link href="/admin" className="block">
                <Button variant="outline" className="w-full">Admin Panel</Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Uitloggen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Debug Informatie</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
              {JSON.stringify({
                userId: user.id,
                email: email,
                emailValid: isEmailValid,
                role: userRole,
                metadata: user.publicMetadata,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
