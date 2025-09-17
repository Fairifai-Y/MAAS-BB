'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Check,
  X,
  FileText,
  Image,
  Globe,
  Mail,
  Share2,
  Settings,
  BarChart3,
  History
} from 'lucide-react';
import CustomerLayout from '@/components/customer-layout';
import { useUser } from '@clerk/nextjs';

interface CustomerPackage {
  id: string;
  packages: {
    name: string;
    description: string;
    maxHours: number;
    price: number;
  };
  status: string;
  startDate: string;
  endDate?: string;
}

interface Activity {
  id: string;
  description: string;
  hours: number;
  date: string;
  status: string;
  employee: {
    user: {
      name: string;
    };
  };
}

interface DeliveredProduct {
  id: string;
  name: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  category: 'WEBSITE' | 'SOCIAL_MEDIA' | 'EMAIL_MARKETING' | 'DESIGN' | 'CONTENT';
  completedAt?: string;
  assignedTo?: string;
  progress?: number;
}

interface DashboardData {
  packages: CustomerPackage[];
  activities: Activity[];
  deliveredProducts: DeliveredProduct[];
  totalHoursUsed: number;
  totalHoursRemaining: number;
  completedActivities: number;
  pendingActivities: number;
}

interface ReportData {
  actions: any[];
  activities: any[];
  totalHours: number;
  completedActions: number;
  pendingActions: number;
}

export default function CustomerDashboard() {
  const { user, isLoaded } = useUser();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    packages: [],
    activities: [],
    deliveredProducts: [],
    totalHoursUsed: 0,
    totalHoursRemaining: 0,
    completedActivities: 0,
    pendingActivities: 0
  });
  const [reportData, setReportData] = useState<ReportData>({
    actions: [],
    activities: [],
    totalHours: 0,
    completedActions: 0,
    pendingActions: 0
  });
  const [showReports, setShowReports] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [actionsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/employee/actions'),
        fetch('/api/employee/activities')
      ]);

      let actions = [];
      let activities = [];

      if (actionsResponse.ok) {
        actions = await actionsResponse.json();
      } else {
        console.error('Failed to fetch actions:', actionsResponse.status);
      }

      if (activitiesResponse.ok) {
        activities = await activitiesResponse.json();
      } else {
        console.error('Failed to fetch activities:', activitiesResponse.status);
      }

      // Ensure arrays are valid
      if (!Array.isArray(activities)) {
        activities = [];
      }
      if (!Array.isArray(actions)) {
        actions = [];
      }

      const totalHoursUsed = actions.reduce((sum: number, action: any) => 
        sum + (Number(action.actualHours) || Number(action.plannedHours) || 0), 0
      );

      const totalPlannedHours = actions.reduce((sum: number, action: any) => 
        sum + (Number(action.plannedHours) || 0), 0
      );

      const completedActions = actions.filter((a: any) => 
        a.status === 'COMPLETED'
      ).length;

      const pendingActions = actions.filter((a: any) => 
        a.status === 'PLANNED' || a.status === 'IN_PROGRESS'
      ).length;

      setDashboardData({
        packages: [], // No packages for employees
        activities,
        deliveredProducts: actions, // Use actions as "delivered products"
        totalHoursUsed: Number(totalHoursUsed) || 0,
        totalHoursRemaining: Number(totalPlannedHours - totalHoursUsed) || 0,
        completedActivities: Number(completedActions) || 0,
        pendingActivities: Number(pendingActions) || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default values on error
      setDashboardData({
        packages: [],
        activities: [],
        deliveredProducts: [],
        totalHoursUsed: 0,
        totalHoursRemaining: 0,
        completedActivities: 0,
        pendingActivities: 0
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Afgerond';
      case 'IN_PROGRESS': return 'In Uitvoering';
      case 'PENDING': return 'Wachtend';
      default: return 'Onbekend';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'WEBSITE': return <Globe className="w-4 h-4" />;
      case 'SOCIAL_MEDIA': return <Share2 className="w-4 h-4" />;
      case 'EMAIL_MARKETING': return <Mail className="w-4 h-4" />;
      case 'DESIGN': return <Image className="w-4 h-4" />;
      case 'CONTENT': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'WEBSITE': return 'Website';
      case 'SOCIAL_MEDIA': return 'Social Media';
      case 'EMAIL_MARKETING': return 'Email Marketing';
      case 'DESIGN': return 'Design';
      case 'CONTENT': return 'Content';
      default: return 'Overig';
    }
  };

  // Calculate package usage percentage
  const getPackageUsagePercentage = (pkg: CustomerPackage) => {
    if (pkg.packages.maxHours === 0) return 0;
    return Math.min((Number(dashboardData.totalHoursUsed || 0) / pkg.packages.maxHours) * 100, 100);
  };


  const fetchReportData = async (period: string) => {
    setIsLoadingReports(true);
    try {
      const [actionsResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/employee/reports?period=${period}&type=actions`),
        fetch(`/api/employee/reports?period=${period}&type=activities`)
      ]);

      let actions = [];
      let activities = [];

      if (actionsResponse.ok) {
        actions = await actionsResponse.json();
      } else {
        console.error('Failed to fetch report actions:', actionsResponse.status);
      }

      if (activitiesResponse.ok) {
        activities = await activitiesResponse.json();
      } else {
        console.error('Failed to fetch report activities:', activitiesResponse.status);
      }

      // Ensure arrays are valid
      if (!Array.isArray(activities)) {
        activities = [];
      }
      if (!Array.isArray(actions)) {
        actions = [];
      }

      const totalHours = actions.reduce((sum: number, action: any) => 
        sum + (Number(action.actualHours) || Number(action.plannedHours) || 0), 0
      );

      const completedActions = actions.filter((a: any) => 
        a.status === 'COMPLETED'
      ).length;

      const pendingActions = actions.filter((a: any) => 
        a.status === 'PLANNED' || a.status === 'IN_PROGRESS'
      ).length;

      setReportData({
        actions,
        activities,
        totalHours: Number(totalHours) || 0,
        completedActions: Number(completedActions) || 0,
        pendingActions: Number(pendingActions) || 0
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setReportData({
        actions: [],
        activities: [],
        totalHours: 0,
        completedActions: 0,
        pendingActions: 0
      });
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    fetchReportData(period);
  };

  const toggleReports = () => {
    if (!showReports) {
      fetchReportData(selectedPeriod);
    }
    setShowReports(!showReports);
  };

  return (
    <CustomerLayout title="Mijn Fitchannel Dashboard" description="Welkom terug! Hier vind je een overzicht van jouw acties en werkzaamheden.">
      
      {/* Reports Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleReports}
            variant={showReports ? "default" : "outline"}
            className="flex items-center"
          >
            {showReports ? (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Verberg Rapportage
              </>
            ) : (
              <>
                <History className="w-4 h-4 mr-2" />
                Toon Rapportage
              </>
            )}
          </Button>
          
          {showReports && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Periode:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="3months">3 Maanden</option>
                <option value="6months">6 Maanden</option>
                <option value="1year">1 Jaar</option>
                <option value="all">Alle Tijd</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Employee Overview Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mijn Werk Overzicht</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Medewerker Dashboard</h3>
            <p className="text-gray-600">Hier zie je een overzicht van jouw acties en activiteiten.</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Acties</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.deliveredProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.completedActivities} afgerond
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uren Gewerkt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(dashboardData.totalHoursUsed || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {Number(dashboardData.totalHoursRemaining || 0).toFixed(1)} uren gepland
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afgeronde Acties</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.completedActivities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Openstaande Acties</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingActivities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      {showReports && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historische Rapportage</h2>
          
          {isLoadingReports ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="text-gray-600">Rapportage laden...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totaal Acties</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.actions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {reportData.completedActions} afgerond
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totaal Uren</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Number(reportData.totalHours || 0).toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Over geselecteerde periode
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Afgeronde Acties</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.completedActions}</div>
                  <p className="text-xs text-muted-foreground">
                    In geselecteerde periode
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Openstaande Acties</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.pendingActions}</div>
                  <p className="text-xs text-muted-foreground">
                    In geselecteerde periode
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Historical Actions List */}
          {!isLoadingReports && reportData.actions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Historische Acties ({selectedPeriod === 'all' ? 'Alle Tijd' : selectedPeriod})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.actions.slice(0, 10).map((action: any) => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-gray-600">
                          {action.description} • {new Date(action.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Number(action.actualHours || action.plannedHours || 0).toFixed(1)} uren</p>
                        <Badge className={getActivityStatusColor(action.status)}>
                          {action.status === 'COMPLETED' ? 'Afgerond' : 
                           action.status === 'IN_PROGRESS' ? 'Bezig' : 'Gepland'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {reportData.actions.length > 10 && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      En {reportData.actions.length - 10} meer acties...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoadingReports && reportData.actions.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Geen historische data</h3>
                <p className="text-gray-600">Er zijn geen acties gevonden voor de geselecteerde periode.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recente Acties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.deliveredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen acties gevonden</h3>
              <p className="text-gray-600">Je hebt nog geen acties aangemaakt. Ga naar de Acties pagina om er een aan te maken.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.deliveredProducts.slice(0, 5).map((action: any) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-gray-600">
                      {action.description} • {new Date(action.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Number(action.actualHours || action.plannedHours || 0).toFixed(1)} uren</p>
                    <Badge className={getActivityStatusColor(action.status)}>
                      {action.status === 'COMPLETED' ? 'Afgerond' : 
                       action.status === 'IN_PROGRESS' ? 'Bezig' : 'Gepland'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </CustomerLayout>
  );
} 