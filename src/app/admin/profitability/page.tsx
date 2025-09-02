'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';

interface ProfitabilityData {
  customer: string;
  currentHours: number;
  currentRevenue: number;
  realRevenue: number;
  currentProfit: number;
  realProfit: number;
  currentMargin: number;
  realMargin: number;
  profitDifference: number;
  marginDifference: number;
  hourlyRateCurrent: number;
  hourlyRateReal: number;
  status: 'profit' | 'risk' | 'loss';
}

export default function ProfitabilityPage() {
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalHours: 0,
    totalCurrentRevenue: 0,
    totalRealRevenue: 0,
    totalProfit: 0,
    averageMargin: 0
  });

  useEffect(() => {
    fetchProfitabilityData();
  }, []);

  const fetchProfitabilityData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/profitability');
      if (response.ok) {
        const data = await response.json();
        setProfitabilityData(data.analysis);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch profitability data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'profit': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'loss': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'profit': return 'bg-green-100 text-green-800';
      case 'risk': return 'bg-yellow-100 text-yellow-800';
      case 'loss': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'profit': return 'Winstgevend';
      case 'risk': return 'Risico';
      case 'loss': return 'Verlies';
      default: return 'Onbekend';
    }
  };

  const profitableCustomers = profitabilityData.filter(c => c.realMargin > 20);
  const riskCustomers = profitabilityData.filter(c => c.realMargin >= 0 && c.realMargin <= 20);
  const lossCustomers = profitabilityData.filter(c => c.realMargin < 0);

  return (
    <AdminLayout 
      title="Winstgevendheid Analyse" 
      description="Analyse van klant winstgevendheid en prijsoptimalisatie kansen"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="text-lg text-gray-600">Winstgevendheid data laden...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Uren</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalHours}</div>
                <p className="text-xs text-muted-foreground">Uren per maand</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Huidige Omzet</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                                 <div className="text-2xl font-bold">€{(summary.totalCurrentRevenue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Per maand</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Echte Omzet</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                                 <div className="text-2xl font-bold">€{(summary.totalRealRevenue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Per maand</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Winst</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                                 <div className="text-2xl font-bold">€{(summary.totalProfit || 0).toLocaleString()}</div>
                 <p className="text-xs text-muted-foreground">
                   {(summary.averageMargin || 0).toFixed(1)}% gemiddelde marge
                 </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Winstgevende Klanten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{profitableCustomers.length}</div>
                                 <p className="text-sm text-gray-600">
                   {profitabilityData.length > 0 ? ((profitableCustomers.length / profitabilityData.length) * 100).toFixed(0) : '0'}% van alle klanten
                 </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Risico Klanten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{riskCustomers.length}</div>
                                 <p className="text-sm text-gray-600">
                   {profitabilityData.length > 0 ? ((riskCustomers.length / profitabilityData.length) * 100).toFixed(0) : '0'}% van alle klanten
                 </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  Verlies Klanten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{lossCustomers.length}</div>
                                 <p className="text-sm text-gray-600">
                   {profitabilityData.length > 0 ? ((lossCustomers.length / profitabilityData.length) * 100).toFixed(0) : '0'}% van alle klanten
                 </p>
              </CardContent>
            </Card>
          </div>

          {/* Customer Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Winstgevende Klanten */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Winstgevende Klanten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitableCustomers.map((customer) => (
                    <div key={customer.customer} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{customer.customer}</h4>
                        <Badge className={getStatusColor(customer.status)}>
                          {getStatusText(customer.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Uren:</span>
                          <span className="ml-2 font-medium">{customer.currentHours}h/maand</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Uurtarief:</span>
                          <span className="ml-2 font-medium">€{customer.hourlyRateReal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Omzet:</span>
                          <span className="ml-2 font-medium">€{customer.realRevenue || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Winst:</span>
                          <span className="ml-2 font-medium text-green-600">
                            €{customer.realProfit || 0} ({customer.realMargin?.toFixed(1) || '0.0'}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risico & Verlies Klanten */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Risico & Verlies Klanten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...riskCustomers, ...lossCustomers].map((customer) => (
                    <div key={customer.customer} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{customer.customer}</h4>
                        <Badge className={getStatusColor(customer.status)}>
                          {getStatusText(customer.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Uren:</span>
                          <span className="ml-2 font-medium">{customer.currentHours}h/maand</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Uurtarief:</span>
                          <span className="ml-2 font-medium">€{customer.hourlyRateReal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Omzet:</span>
                          <span className="ml-2 font-medium">€{customer.realRevenue || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Winst:</span>
                          <span className={`ml-2 font-medium ${(customer.realProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            €{customer.realProfit || 0} ({customer.realMargin?.toFixed(1) || '0.0'}%)
                          </span>
                        </div>
                      </div>
                      {customer.realMargin < 0 && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          ⚠️ Deze klant maakt verlies. Overweeg prijsverhoging of urenoptimalisatie.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>💡 Aanbevelingen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lossCustomers.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">🔴 Prioriteit: Verliesgevende Klanten</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {lossCustomers.map(customer => (
                        <li key={customer.customer}>
                          • <strong>{customer.customer}</strong>: Verhoog prijs van €{customer.realRevenue || 0} naar minimaal €{((customer.currentHours || 0) * 75 * 1.2).toFixed(0)} (+20%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {riskCustomers.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">🟡 Optimalisatie: Risico Klanten</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {riskCustomers.map(customer => (
                        <li key={customer.customer}>
                          • <strong>{customer.customer}</strong>: Overweeg prijsverhoging of urenoptimalisatie (huidige marge: {customer.realMargin?.toFixed(1) || '0.0'}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🟢 Kansen: Winstgevende Klanten</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Behoud hoge marges voor winstgevende klanten</li>
                    <li>• Overweeg uitbreiding van diensten voor klanten met hoge marges</li>
                    <li>• Gebruik winstgevende klanten als referentie voor nieuwe klanten</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">📊 Algemene Aanbevelingen</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Stel minimum uurtarief in van €100 voor nieuwe klanten</li>
                    <li>• Implementeer jaarlijkse prijsindexering van 3-5%</li>
                    <li>• Optimaliseer uren voor klanten met lage marges</li>
                    <li>• Overweeg premium diensten voor klanten met hoge marges</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
