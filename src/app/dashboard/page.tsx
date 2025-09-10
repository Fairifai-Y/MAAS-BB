'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  Share2
} from 'lucide-react';
import CustomerLayout from '@/components/customer-layout';

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

export default function CustomerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    packages: [],
    activities: [],
    deliveredProducts: [],
    totalHoursUsed: 0,
    totalHoursRemaining: 0,
    completedActivities: 0,
    pendingActivities: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [packagesResponse, activitiesResponse, productsResponse] = await Promise.all([
        fetch('/api/customer/packages'),
        fetch('/api/customer/activities'),
        fetch('/api/customer/products')
      ]);

      let packages = [];
      let activities = [];
      let deliveredProducts = [];

      if (packagesResponse.ok) {
        packages = await packagesResponse.json();
      } else {
        console.error('Failed to fetch packages:', packagesResponse.status);
      }

      if (activitiesResponse.ok) {
        activities = await activitiesResponse.json();
      } else {
        console.error('Failed to fetch activities:', activitiesResponse.status);
      }

      if (productsResponse.ok) {
        deliveredProducts = await productsResponse.json();
      } else {
        console.error('Failed to fetch products:', productsResponse.status);
      }

      // Ensure activities is an array before using reduce
      if (!Array.isArray(activities)) {
        activities = [];
      }

      // Ensure packages is an array before using reduce
      if (!Array.isArray(packages)) {
        packages = [];
      }

      const totalHoursUsed = activities.reduce((sum: number, activity: Activity) => 
        sum + activity.hours, 0
      );

      const totalMaxHours = packages.reduce((sum: number, pkg: CustomerPackage) => 
        sum + pkg.packages.maxHours, 0
      );

      const completedActivities = activities.filter((a: Activity) => 
        a.status === 'COMPLETED'
      ).length;

      const pendingActivities = activities.filter((a: Activity) => 
        a.status === 'PENDING'
      ).length;

      // Ensure deliveredProducts is an array
      if (!Array.isArray(deliveredProducts)) {
        deliveredProducts = [];
      }

      setDashboardData({
        packages,
        activities,
        deliveredProducts,
        totalHoursUsed,
        totalHoursRemaining: totalMaxHours - totalHoursUsed,
        completedActivities,
        pendingActivities
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
    return Math.min((dashboardData.totalHoursUsed / pkg.packages.maxHours) * 100, 100);
  };

  return (
    <CustomerLayout title="Mijn Fitchannel Dashboard" description="Welkom terug! Hier vind je een overzicht van je pakket en opgeleverde producten.">

      {/* Package Overview Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mijn Pakket Overzicht</h2>
        {dashboardData.packages.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen pakketten gevonden</h3>
              <p className="text-gray-600">Er zijn momenteel geen pakketten gekoppeld aan jouw account.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.packages.map((pkg) => {
            const usagePercentage = getPackageUsagePercentage(pkg);
            const remainingPercentage = 100 - usagePercentage;
            
            return (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{pkg.packages.name}</CardTitle>
                      <p className="text-gray-600 mt-1">{pkg.packages.description}</p>
                    </div>
                    <Badge className={getStatusColor(pkg.status)}>
                      {pkg.status === 'ACTIVE' ? 'Actief' : pkg.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Package Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">€{pkg.packages.price}</div>
                        <div className="text-sm text-gray-600">Maandprijs</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{pkg.packages.maxHours}</div>
                        <div className="text-sm text-gray-600">Uren per maand</div>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Pakket Gebruik</span>
                        <span className="text-sm text-gray-600">{usagePercentage.toFixed(1)}% gebruikt</span>
                      </div>
                      <Progress value={usagePercentage} className="h-3" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{dashboardData.totalHoursUsed} uren gebruikt</span>
                        <span>{dashboardData.totalHoursRemaining} uren over</span>
                      </div>
                    </div>

                    {/* Package Status */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-900">Pakket Status</div>
                        <div className="text-sm text-blue-700">
                          {remainingPercentage > 20 ? 'Ruim voldoende uren beschikbaar' : 
                           remainingPercentage > 5 ? 'Nog enkele uren beschikbaar' : 
                           'Bijna op - neem contact op'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-600">{remainingPercentage.toFixed(1)}%</div>
                        <div className="text-xs text-amber-600">over</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Producten</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.deliveredProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.deliveredProducts.filter(p => p.status === 'COMPLETED').length} afgerond
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uren Gebruikt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalHoursUsed}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.totalHoursRemaining} uren over
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
            <CardTitle className="text-sm font-medium">Wachtende Acties</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingActivities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recente Activiteiten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.activities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen activiteiten gevonden</h3>
              <p className="text-gray-600">Er zijn momenteel geen activiteiten gekoppeld aan jouw pakketten.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">
                      {activity.employee.user.name} • {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{activity.hours} uren</p>
                    <Badge className={getActivityStatusColor(activity.status)}>
                      {activity.status}
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