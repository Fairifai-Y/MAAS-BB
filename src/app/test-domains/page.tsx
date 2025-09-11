'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { isValidEmailDomain, getAllowedEmailDomainsClient, getEmailDomainError } from '@/lib/auth-utils';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TestDomainsPage() {
  const [testEmail, setTestEmail] = useState('');
  const [testResults, setTestResults] = useState<Array<{email: string, valid: boolean, error?: string}>>([]);

  const allowedDomains = getAllowedEmailDomainsClient();

  const testEmailValidation = () => {
    if (!testEmail.trim()) return;
    
    const isValid = isValidEmailDomain(testEmail);
    const error = isValid ? undefined : getEmailDomainError(testEmail);
    
    setTestResults(prev => [...prev, { email: testEmail, valid: isValid, error }]);
    setTestEmail('');
  };

  const runPredefinedTests = () => {
    const testCases = [
      'test@fitchannel.com',
      'user@champ.nl', 
      'admin@brightbrown.nl',
      'support@e-leones.com',
      'TEST@FITCHANNEL.COM',
      'User@Champ.NL',
      'test@gmail.com',
      'user@yahoo.com',
      'admin@example.com',
      'invalid-email',
      '@fitchannel.com'
    ];

    const results = testCases.map(email => {
      const isValid = isValidEmailDomain(email);
      const error = isValid ? undefined : getEmailDomainError(email);
      return { email, valid: isValid, error };
    });

    setTestResults(results);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Domain Validation Test</h1>
        
        {/* Allowed Domains */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Allowed Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allowedDomains.map((domain, index) => (
                <Badge key={index} variant="secondary">
                  {domain}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Email Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter email to test..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testEmailValidation()}
                className="flex-1"
              />
              <Button onClick={testEmailValidation} disabled={!testEmail.trim()}>
                Test Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <div className="flex gap-4 mb-6">
          <Button onClick={runPredefinedTests} variant="outline">
            Run Predefined Tests
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {result.valid ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-mono">{result.email}</span>
                      <Badge variant={result.valid ? "default" : "destructive"}>
                        {result.valid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                    {result.error && (
                      <div className="text-sm text-red-600 max-w-md">
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
