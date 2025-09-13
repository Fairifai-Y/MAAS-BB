import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Haal echte data op uit de database
    const [
      activeCustomers,
      inactiveCustomers,
      packages,
      customerPackages,
      employees,
      activityTemplates
    ] = await Promise.all([
      // Totaal aantal actieve klanten
      prisma.customers.count({
        where: { isActive: true }
      }),
      
      // Totaal aantal inactieve klanten
      prisma.customers.count({
        where: { isActive: false }
      }),
      
      // Totaal aantal pakketten
      prisma.package.count(),
      
      // Actieve customer packages
      prisma.customer_packages.findMany({
        where: { status: 'ACTIVE' },
        include: {
          packages: true,
          customers: true
        }
      }),
      
      // Totaal aantal medewerkers
      prisma.employees.count(),
      
      // Totaal aantal activiteiten
      prisma.activityTemplate.count()
    ]);

    // Bereken totale uren en omzet (alleen actieve klanten)
    const totalHours = customerPackages.reduce((sum, cp) => {
      if (cp.customers.isActive) {
        return sum + Number(cp.packages.maxHours || 0);
      }
      return sum;
    }, 0);
    const totalRevenue = customerPackages.reduce((sum, cp) => {
      if (cp.customers.isActive) {
        return sum + Number(cp.packages.price || 0);
      }
      return sum;
    }, 0);
    
    // Bereken actieve abonnementen (alleen actieve klanten)
    const activeSubscriptions = customerPackages.filter(cp => cp.customers.isActive).length;
    
    // Bereken gemiddelde uurtarief
    const averageHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;
    
    // Bereken gemiddelde pakketprijs
    const averagePackagePrice = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;
    
    // Bereken beschikbare uren per maand (alle medewerkers * contracturen * 45 weken / 12 maanden)
    const employeesWithContracts = await prisma.employees.findMany({
      select: { contractHours: true }
    });
    const totalWeeklyHours = employeesWithContracts.reduce((sum, emp) => sum + (emp.contractHours || 40), 0);
    const totalYearlyHours = totalWeeklyHours * 45; // 45 werkweken per jaar
    const availableHoursPerMonth = Math.round((totalYearlyHours / 12) * 100) / 100; // Gemiddeld per maand
    
    // Bereken verkochte uren per maand (totaal uren van alle actieve pakketten)
    const soldHoursPerMonth = totalHours;
    
    // Bereken uitgevoerde uren per maand (uren uit de activity tabel)
    const executedActivities = await prisma.activity.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Begin van deze maand
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) // Begin van volgende maand
        }
      }
    });
    
    const executedHoursPerMonth = executedActivities.reduce((sum, activity) => {
      const hours = Number(activity.hours) || 0;
      return sum + hours;
    }, 0);
    
    // Bereken declarabel percentage (verkochte uren / beschikbare uren)
    const declarablePercentage = availableHoursPerMonth > 0 ? (soldHoursPerMonth / availableHoursPerMonth) * 100 : 0;
    
    // Bereken efficiëntie percentage (verkochte uren / uitgevoerde uren)
    const efficiencyPercentage = executedHoursPerMonth > 0 ? (soldHoursPerMonth / executedHoursPerMonth) * 100 : 0;

    const realStats = {
      totalCustomers: activeCustomers,
      inactiveCustomers: inactiveCustomers,
      totalPackages: packages,
      totalEmployees: employees,
      totalActivities: activityTemplates,
      activeSubscriptions: activeSubscriptions,
      totalHours: Math.round(totalHours * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageHourlyRate: Math.round(averageHourlyRate * 100) / 100,
      averagePackagePrice: Math.round(averagePackagePrice * 100) / 100,
      pendingActivities: 0, // Placeholder voor toekomstige implementatie
      availableHoursPerMonth: availableHoursPerMonth,
      soldHoursPerMonth: Math.round(soldHoursPerMonth * 100) / 100,
      executedHoursPerMonth: Math.round(executedHoursPerMonth * 100) / 100,
      declarablePercentage: Math.round(declarablePercentage * 100) / 100,
      efficiencyPercentage: Math.round(efficiencyPercentage * 100) / 100
    };

    return NextResponse.json(realStats);
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 