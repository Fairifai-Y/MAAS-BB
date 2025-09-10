import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, Users, CheckCircle, Shield, Zap, BarChart3, Settings, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/logo_fitchannel.png"
                alt="Fitchannel Logo"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <div className="flex space-x-3">
              <Link href="/auth">
                <Button variant="outline" size="sm">Inloggen</Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Registreren</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Image
              src="/logo_fitchannel.png"
              alt="Fitchannel Logo"
              width={150}
              height={45}
              className="h-12 w-auto mx-auto mb-4"
            />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Welkom bij Fitchannel
          </h1>
          <p className="text-lg text-blue-100 mb-3 max-w-2xl mx-auto">
            Het interne platform voor Fitchannel medewerkers
          </p>
          <p className="text-base text-blue-200 font-semibold mb-6">
            Change the Channel
          </p>
          <div className="flex justify-center space-x-3">
            <Link href="/auth">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                <Shield className="w-4 h-4 mr-2" />
                Inloggen
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Users className="w-4 h-4 mr-2" />
                Registreren
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Platform Functionaliteiten
            </h2>
            <p className="text-lg text-gray-600">
              Alles wat je nodig hebt voor efficiënt klantbeheer en project tracking
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Klantbeheer</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Beheer alle klantgegevens, pakketten en contracten op één plek. 
                  Overzichtelijk en efficiënt.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Uren Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Track uren per project en klant. Real-time inzicht in 
                  projectvoortgang en resource planning.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Rapportage</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Uitgebreide rapportages en analytics. Monitor winstgevendheid 
                  en performance per klant.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Pakketten</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Beheer service pakketten en prijzen. Configureer 
                  automatische facturering en contracten.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Activiteiten</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Plan en beheer activiteiten per klant. 
                  Integratie met externe tools zoals Rompslomp.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Volledig admin panel voor gebruikersbeheer, 
                  configuratie en systeem instellingen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Snelle Toegang
            </h2>
            <p className="text-lg text-gray-600">
              Direct naar de belangrijkste functies van het platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <h3 className="font-semibold text-lg mb-2">Rapportages</h3>
                  <p className="text-gray-600 text-sm">Analytics en overzichten</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/auth">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Instellingen</h3>
                  <p className="text-gray-600 text-sm">Platform configuratie</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side - Logo and tagline */}
            <div className="text-center md:text-left">
              <div className="mb-4">
                <Image
                  src="/logo_fitchannel.png"
                  alt="Fitchannel Logo"
                  width={120}
                  height={36}
                  className="h-9 w-auto mx-auto md:mx-0 mb-2"
                />
              </div>
              <p className="text-blue-200 font-semibold text-sm">
                Change the Channel
              </p>
            </div>
            
            {/* Right side - Contact info and image */}
            <div className="text-center md:text-right">
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-300">Contactgegevens</h4>
                <div className="space-y-1 text-gray-400 text-sm">
                  <p>📧 info@fitchannel.com</p>
                  <p>📞 +31 (0)20 123 4567</p>
                  <p>📍 Amsterdam, Nederland</p>
                </div>
              </div>
              
              <div className="flex justify-center md:justify-end">
                <Image
                  src="/image002.png"
                  alt="Fitchannel Image"
                  width={80}
                  height={60}
                  className="h-12 w-auto opacity-80"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-4 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 Fitchannel. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
