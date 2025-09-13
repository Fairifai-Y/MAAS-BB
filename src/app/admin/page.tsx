'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Loader2,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';
import { LineChart, BarChart, DoughnutChart, createLineChartData, createBarChartData, createDoughnutChartData } from '@/components/ui/charts';



interface DashboardStats {
  totalCustomers: number;
  inactiveCustomers: number;
  totalPackages: number;
  totalEmployees: number;
  totalActivities: number;
  totalHours: number;
  totalRevenue: number;
  activeSubscriptions: number;
  averageHourlyRate: number;
  averagePackagePrice: number;
  pendingActivities: number;
  availableHoursPerMonth: number;
  soldHoursPerMonth: number;
  executedHoursPerMonth: number;
  declarablePercentage: number;
  efficiencyPercentage: number;
}

interface ChartData {
  revenue?: Array<{ month: string; revenue: number }>;
  hours?: Array<{ month: string; hours: number }>;
  customers?: Array<{ month: string; active: number; inactive: number; total: number }>;
  activities?: Array<{ month: string; completed: number; pending: number; total: number; hours: number }>;
  packageDistribution?: Array<{ name: string; count: number }>;
  categoryDistribution?: Array<{ category: string; count: number; hours: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    inactiveCustomers: 0,
    totalPackages: 0,
    totalEmployees: 0,
    totalActivities: 0,
    totalHours: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    averageHourlyRate: 0,
    averagePackagePrice: 0,
    pendingActivities: 0,
    availableHoursPerMonth: 0,
    soldHoursPerMonth: 0,
    executedHoursPerMonth: 0,
    declarablePercentage: 0,
    efficiencyPercentage: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({});
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingStats(true);
      
      try {
        await fetchStats();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadData();
  }, []);



  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status);
        setStats({
          totalCustomers: 0,
          inactiveCustomers: 0,
          totalPackages: 0,
          totalEmployees: 0,
          totalActivities: 0,
          totalHours: 0,
          totalRevenue: 0,
          activeSubscriptions: 0,
          averageHourlyRate: 0,
          averagePackagePrice: 0,
          pendingActivities: 0,
          availableHoursPerMonth: 0,
          soldHoursPerMonth: 0,
          executedHoursPerMonth: 0,
          declarablePercentage: 0,
          efficiencyPercentage: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        totalCustomers: 0,
        inactiveCustomers: 0,
        totalPackages: 0,
        totalEmployees: 0,
        totalActivities: 0,
        totalHours: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        averageHourlyRate: 0,
        averagePackagePrice: 0,
        pendingActivities: 0,
        availableHoursPerMonth: 0,
        soldHoursPerMonth: 0,
        executedHoursPerMonth: 0,
        declarablePercentage: 0,
        efficiencyPercentage: 0
      });
    }
  };

  const fetchChartData = async (period: string) => {
    setIsLoadingCharts(true);
    try {
      const response = await fetch(`/api/admin/charts?period=${period}&type=all`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else {
        console.error('Failed to fetch chart data:', response.status);
        setChartData({});
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setChartData({});
    } finally {
      setIsLoadingCharts(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    fetchChartData(period);
  };

  const toggleCharts = () => {
    if (!showCharts) {
      fetchChartData(selectedPeriod);
    }
    setShowCharts(!showCharts);
  };



  return (
    <AdminLayout 
      title="Admin Dashboard" 
      description="Beheer je platform en pakketten"
    >
      
      {/* Charts Toggle and Period Selector */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleCharts}
            variant={showCharts ? "default" : "outline"}
            className="flex items-center"
          >
            {showCharts ? (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Verberg Grafieken
              </>
            ) : (
              <>
                <LineChartIcon className="w-4 h-4 mr-2" />
                Toon Grafieken
              </>
            )}
          </Button>
          
          {showCharts && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Periode:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="1month">1 Maand</option>
                <option value="3months">3 Maanden</option>
                <option value="6months">6 Maanden</option>
                <option value="1year">1 Jaar</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="mb-8">
          {isLoadingCharts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="ml-2 text-gray-600">Grafieken laden...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              {chartData.revenue && chartData.revenue.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Omzet Over Tijd
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={createLineChartData(
                        chartData.revenue.map(item => item.month),
                        [{
                          label: 'Omzet (€)',
                          data: chartData.revenue.map(item => item.revenue),
                          color: '#10B981'
                        }]
                      )}
                      height={250}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Hours Chart */}
              {chartData.hours && chartData.hours.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Uren Over Tijd
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={createLineChartData(
                        chartData.hours.map(item => item.month),
                        [{
                          label: 'Uren',
                          data: chartData.hours.map(item => item.hours),
                          color: '#3B82F6'
                        }]
                      )}
                      height={250}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Customer Growth Chart */}
              {chartData.customers && chartData.customers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Klant Groei
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={createBarChartData(
                        chartData.customers.map(item => item.month),
                        [
                          {
                            label: 'Actieve Klanten',
                            data: chartData.customers.map(item => item.active),
                            color: '#10B981'
                          },
                          {
                            label: 'Inactieve Klanten',
                            data: chartData.customers.map(item => item.inactive),
                            color: '#EF4444'
                          }
                        ]
                      )}
                      height={250}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Activities Chart */}
              {chartData.activities && chartData.activities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Activiteiten Over Tijd
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={createBarChartData(
                        chartData.activities.map(item => item.month),
                        [
                          {
                            label: 'Voltooid',
                            data: chartData.activities.map(item => item.completed),
                            color: '#10B981'
                          },
                          {
                            label: 'In Behandeling',
                            data: chartData.activities.map(item => item.pending),
                            color: '#F59E0B'
                          }
                        ]
                      )}
                      height={250}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Package Distribution */}
              {chartData.packageDistribution && chartData.packageDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Pakket Verdeling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DoughnutChart
                      data={createDoughnutChartData(
                        chartData.packageDistribution.map(item => item.name),
                        chartData.packageDistribution.map(item => item.count)
                      )}
                      height={250}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Category Distribution */}
              {chartData.categoryDistribution && chartData.categoryDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Activiteit Categorieën
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DoughnutChart
                      data={createDoughnutChartData(
                        chartData.categoryDistribution.map(item => item.category),
                        chartData.categoryDistribution.map(item => item.count)
                      )}
                      height={250}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Klanten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalCustomers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Actieve klanten
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactieve Klanten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.inactiveCustomers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Inactieve klanten
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Medewerkers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Team leden
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Uren</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalHours || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Uren deze maand
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Omzet (Actieve Klanten)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{stats.totalRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Deze maand - alleen actieve klanten
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Abonnementen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Lopende abonnementen
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Pakketten</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalPackages || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Beschikbare pakketten
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gem. Uurtarief</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{stats.averageHourlyRate || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Per uur
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gem. Pakketprijs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{stats.averagePackagePrice || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Per pakket
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hours Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beschikbare Uren per Maand</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.availableHoursPerMonth || 0}h</div>
                <p className="text-xs text-muted-foreground">
                  Totaal team capaciteit
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verkochte Uren per Maand</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.soldHoursPerMonth || 0}h</div>
                <p className="text-xs text-muted-foreground">
                  Uren verkocht aan klanten
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Metrics - Uitgevoerde Uren en Percentages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uitgevoerde Uren per Maand</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.executedHoursPerMonth || 0}h</div>
                <p className="text-xs text-muted-foreground">
                  Uren daadwerkelijk uitgevoerd
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Declarabel Percentage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.declarablePercentage || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Verkochte / Beschikbare uren
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiëntie Percentage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.efficiencyPercentage || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Verkochte / Uitgevoerde uren
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capaciteit Gebruik</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.availableHoursPerMonth > 0 ? 
                    Math.round((stats.soldHoursPerMonth / stats.availableHoursPerMonth) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Verkochte / Beschikbare uren
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>


    </AdminLayout>
  );
} 