import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail } from 'lucide-react';
import Link from 'next/link';
import { getAllowedEmailDomains } from '@/lib/auth-utils';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">Toegang Geweigerd</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Mail className="w-5 h-5" />
            <span>Alleen email adressen van de volgende domeinen zijn toegestaan: {getAllowedEmailDomains().join(', ')}</span>
          </div>
          
          <p className="text-gray-600">
            Deze applicatie is alleen bedoeld voor intern gebruik van Fitchannel. 
            Neem contact op met uw beheerder als u toegang nodig heeft.
          </p>
          
          <div className="pt-4">
            <Link href="/">
              <Button variant="outline" className="w-full">
                Terug naar Homepage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
