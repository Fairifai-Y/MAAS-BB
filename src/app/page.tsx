import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/ui/logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <div className="flex space-x-4">
              <Link href="/auth">
                <Button variant="outline">Inloggen</Button>
              </Link>
              <Link href="/auth">
                <Button>Registreren</Button>
              </Link>
              <Link href="/test-auth">
                <Button variant="secondary">Test Auth</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Managed Application as a Service
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professionele IT-ondersteuning op maat. Kies uit onze flexibele pakketten 
            en laat uw applicaties beheren door ervaren professionals.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth">
              <Button size="lg">Start Nu</Button>
            </Link>
            <Link href="#packages">
              <Button variant="outline" size="lg">Bekijk Pakketten</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Waarom MAAS?
            </h3>
            <p className="text-lg text-gray-600">
              Professionele IT-ondersteuning zonder de complexiteit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Package className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Flexibele Pakketten</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Kies uit verschillende pakketten (XS, S, M, L, XL, XXL) 
                  die passen bij uw behoeften en budget.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Uren Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Transparante urenregistratie door ervaren werknemers 
                  met real-time inzicht in uw projectvoortgang.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Gegarandeerde Kwaliteit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Professionele service met integratie van externe tools 
                  zoals Rompslomp.nl voor optimale workflow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              MAAS Pakketten
            </h3>
            <p className="text-lg text-gray-600">
              Kies het pakket dat het beste bij uw organisatie past
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'MAAS-XS', hours: 10, price: 500, description: 'Klein pakket voor startups' },
              { name: 'MAAS-S', hours: 25, price: 1200, description: 'Groeipakket voor kleine bedrijven' },
              { name: 'MAAS-M', hours: 50, price: 2200, description: 'Middenpakket voor groeiende organisaties' },
              { name: 'MAAS-L', hours: 100, price: 4000, description: 'Groot pakket voor gevestigde bedrijven' },
              { name: 'MAAS-XL', hours: 200, price: 7500, description: 'Enterprise pakket voor grote organisaties' },
              { name: 'MAAS-XXL', hours: 400, price: 14000, description: 'Premium pakket voor multinationals' }
            ].map((pkg) => (
              <Card key={pkg.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-center">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    €{pkg.price}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {pkg.hours} uren per maand
                  </div>
                  <p className="text-gray-600 mb-6">
                    {pkg.description}
                  </p>
                  <Link href="/auth">
                    <Button className="w-full">Kies Pakket</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">MAAS Platform</h4>
              <p className="text-gray-400">
                Professionele IT-ondersteuning op maat voor moderne organisaties.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Applicatie Beheer</li>
                <li>Uren Tracking</li>
                <li>Project Management</li>
                <li>Support & Onderhoud</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Integraties</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Rompslomp.nl</li>
                <li>Stripe Payments</li>
                <li>Buckaroo</li>
                <li>Custom APIs</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@maas-platform.nl</li>
                <li>+31 (0)20 123 4567</li>
                <li>Amsterdam, Nederland</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MAAS Platform. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
