'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      } else {
        setError('Failed to fetch packages');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Fitchannel Platform Test</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Platform Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Database:</strong> {loading ? 'Loading...' : error ? 'Error' : 'Connected'}</p>
              <p><strong>API Routes:</strong> {error ? 'Failed' : 'Working'}</p>
              <p><strong>UI Components:</strong> Working</p>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="pt-6">
              <p>Loading packages...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">Error: {error}</p>
              <Button onClick={fetchPackages} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Available Packages ({packages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg: any) => (
                  <div key={pkg.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{pkg.name}</h3>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                    <p className="text-sm">€{pkg.price} - {pkg.maxHours} hours</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Next Steps:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Configure environment variables in .env.local</li>
            <li>Set up a PostgreSQL database</li>
            <li>Run database migrations: npx prisma db push</li>
            <li>Seed the database: npm run db:seed</li>
            <li>Configure Clerk authentication</li>
            <li>Set up Stripe for payments</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 