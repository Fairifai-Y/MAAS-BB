'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';



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



  return (
    <AdminLayout 
      title="Admin Dashboard" 
      description="Beheer je platform en pakketten"
    >


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