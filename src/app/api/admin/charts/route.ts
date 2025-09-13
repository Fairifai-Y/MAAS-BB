import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6months'; // 1month, 3months, 6months, 1year
    const chartType = searchParams.get('type') || 'all'; // all, revenue, hours, customers, activities

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }

    const chartsData: any = {};

    // Revenue over time (monthly)
    if (chartType === 'all' || chartType === 'revenue') {
      const revenueData = await prisma.customer_packages.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          packages: true,
          customers: true
        },
        orderBy: { createdAt: 'asc' }
      });

      // Group by month
      const monthlyRevenue: { [key: string]: number } = {};
      revenueData.forEach(cp => {
        if (cp.customers.isActive) {
          const monthKey = `${cp.createdAt.getFullYear()}-${String(cp.createdAt.getMonth() + 1).padStart(2, '0')}`;
          monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + Number(cp.packages.price || 0);
        }
      });

      chartsData.revenue = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue * 100) / 100
      }));
    }

    // Hours over time (monthly)
    if (chartType === 'all' || chartType === 'hours') {
      const hoursData = await prisma.customer_packages.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          packages: true,
          customers: true
        },
        orderBy: { createdAt: 'asc' }
      });

      // Group by month
      const monthlyHours: { [key: string]: number } = {};
      hoursData.forEach(cp => {
        if (cp.customers.isActive) {
          const monthKey = `${cp.createdAt.getFullYear()}-${String(cp.createdAt.getMonth() + 1).padStart(2, '0')}`;
          monthlyHours[monthKey] = (monthlyHours[monthKey] || 0) + Number(cp.packages.maxHours || 0);
        }
      });

      chartsData.hours = Object.entries(monthlyHours).map(([month, hours]) => ({
        month,
        hours: Math.round(hours * 100) / 100
      }));
    }

    // Customer growth over time (monthly)
    if (chartType === 'all' || chartType === 'customers') {
      const customerData = await prisma.customers.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Group by month
      const monthlyCustomers: { [key: string]: { active: number, inactive: number } } = {};
      customerData.forEach(customer => {
        const monthKey = `${customer.createdAt.getFullYear()}-${String(customer.createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyCustomers[monthKey]) {
          monthlyCustomers[monthKey] = { active: 0, inactive: 0 };
        }
        if (customer.isActive) {
          monthlyCustomers[monthKey].active++;
        } else {
          monthlyCustomers[monthKey].inactive++;
        }
      });

      chartsData.customers = Object.entries(monthlyCustomers).map(([month, counts]) => ({
        month,
        active: counts.active,
        inactive: counts.inactive,
        total: counts.active + counts.inactive
      }));
    }

    // Activities over time (monthly)
    if (chartType === 'all' || chartType === 'activities') {
      const activitiesData = await prisma.activity.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Group by month
      const monthlyActivities: { [key: string]: { completed: number, pending: number, total: number, hours: number } } = {};
      activitiesData.forEach(activity => {
        const monthKey = `${activity.createdAt.getFullYear()}-${String(activity.createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyActivities[monthKey]) {
          monthlyActivities[monthKey] = { completed: 0, pending: 0, total: 0, hours: 0 };
        }
        
        monthlyActivities[monthKey].total++;
        monthlyActivities[monthKey].hours += Number(activity.hours || 0);
        
        if (activity.status === 'COMPLETED') {
          monthlyActivities[monthKey].completed++;
        } else {
          monthlyActivities[monthKey].pending++;
        }
      });

      chartsData.activities = Object.entries(monthlyActivities).map(([month, data]) => ({
        month,
        completed: data.completed,
        pending: data.pending,
        total: data.total,
        hours: Math.round(data.hours * 100) / 100
      }));
    }

    // Package distribution
    if (chartType === 'all' || chartType === 'packages') {
      const packageData = await prisma.customer_packages.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          packages: true,
          customers: true
        }
      });

      const packageDistribution: { [key: string]: number } = {};
      packageData.forEach(cp => {
        if (cp.customers.isActive) {
          const packageName = cp.packages.name;
          packageDistribution[packageName] = (packageDistribution[packageName] || 0) + 1;
        }
      });

      chartsData.packageDistribution = Object.entries(packageDistribution).map(([name, count]) => ({
        name,
        count
      }));
    }

    // Activity categories distribution
    if (chartType === 'all' || chartType === 'categories') {
      const categoryData = await prisma.activity.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          customer_packages: {
            include: {
              packages: {
                include: {
                  packageActivities: {
                    include: {
                      activityTemplate: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      const categoryDistribution: { [key: string]: { count: number, hours: number } } = {};
      categoryData.forEach(activity => {
        // Try to get category from related package activities
        const packageActivity = activity.customer_packages.packages.packageActivities.find(
          pa => pa.activityTemplate.name === activity.description
        );
        
        const category = packageActivity?.activityTemplate.category || 'OTHER';
        if (!categoryDistribution[category]) {
          categoryDistribution[category] = { count: 0, hours: 0 };
        }
        
        categoryDistribution[category].count++;
        categoryDistribution[category].hours += Number(activity.hours || 0);
      });

      chartsData.categoryDistribution = Object.entries(categoryDistribution).map(([category, data]) => ({
        category,
        count: data.count,
        hours: Math.round(data.hours * 100) / 100
      }));
    }

    return NextResponse.json(chartsData);
  } catch (error) {
    console.error('Failed to fetch charts data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charts data' },
      { status: 500 }
    );
  }
}
