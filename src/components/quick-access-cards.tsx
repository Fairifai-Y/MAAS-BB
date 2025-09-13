'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function QuickAccessCards() {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If not signed in, show auth links
  if (!isSignedIn) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/auth">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Dashboard</h3>
              <p className="text-gray-600 text-sm">Overzicht van alle activiteiten</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/auth">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Klanten</h3>
              <p className="text-gray-600 text-sm">Beheer klantgegevens</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/auth">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Admin Panel</h3>
              <p className="text-gray-600 text-sm">Beheer en rapportages</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    );
  }

  // If signed in, show actual functionality links
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link href="/dashboard">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Dashboard</h3>
            <p className="text-gray-600 text-sm">Overzicht van alle activiteiten</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/admin/customers">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Klanten</h3>
            <p className="text-gray-600 text-sm">Beheer klantgegevens</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/admin">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Admin Panel</h3>
            <p className="text-gray-600 text-sm">Beheer en rapportages</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
