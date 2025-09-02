import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Echte prijzen per klant (maandprijzen)
const realPrices = [
  { customer: 'MSP Mentor', realPrice: 1497 },
  { customer: 'DJM Schoonmaak', realPrice: 2900 },
  { customer: 'Private Gym', realPrice: 599 },
  { customer: 'Scale MSP', realPrice: 999 },
  { customer: 'CentSweets', realPrice: 299 },
  { customer: 'Imagineear', realPrice: 999 },
  { customer: 'Wolfe en Wolfe', realPrice: 399 },
  { customer: 'OnSite', realPrice: 699 },
  { customer: 'Roll-out', realPrice: 1199 },
  { customer: 'Animo', realPrice: 845 },
  { customer: 'Alfa1', realPrice: 799 },
  { customer: 'Fuji Packaging Benelux', realPrice: 1664 },
  { customer: 'Dragintra BV', realPrice: 2498 },
  { customer: 'Florijnz', realPrice: 1299 },
  { customer: 'P&O Kompas', realPrice: 599 },
  { customer: 'B-Konnect / Remote IT', realPrice: 750 },
  { customer: 'Peter Zebra', realPrice: 899 },
  { customer: 'BeRobin', realPrice: 0 },
  { customer: 'Morgo', realPrice: 1899 }
];

export async function GET() {
  try {
    const costPerHour = 75; // €75 per uur
    let totalRealRevenue = 0;
    let totalCurrentRevenue = 0;
    let totalHours = 0;
    let totalProfit = 0;

    const analysis = [];

    for (const priceData of realPrices) {
      // Zoek de customer package
      const customerPackage = await prisma.customer_packages.findFirst({
        where: {
          customers: {
            company: {
              contains: priceData.customer.split(' ')[0] // Match eerste woord van bedrijfsnaam
            }
          }
        },
        include: {
          packages: true,
          customers: true
        }
      });

      if (customerPackage) {
        const currentHours = Number(customerPackage.packages.maxHours) || 0;
        const currentRevenue = Number(customerPackage.packages.price) || 0;
        const realRevenue = priceData.realPrice;
        
        // Bereken winstgevendheid
        const currentCost = currentHours * costPerHour;
        const currentProfit = currentRevenue - currentCost;
        const currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
         
        const realCost = currentHours * costPerHour;
        const realProfit = realRevenue - realCost;
        const realMargin = realRevenue > 0 ? (realProfit / realRevenue) * 100 : 0;
        
        const profitDifference = realProfit - currentProfit;
        const marginDifference = realMargin - currentMargin;
        
        const hourlyRateReal = currentHours > 0 ? realRevenue / currentHours : 0;
        const hourlyRateCurrent = currentHours > 0 ? currentRevenue / currentHours : 0;

        // Bepaal status
        let status: 'profit' | 'risk' | 'loss';
        if (realMargin < 0) status = 'loss';
        else if (realMargin < 20) status = 'risk';
        else status = 'profit';

        analysis.push({
          customer: priceData.customer,
          currentHours,
          currentRevenue,
          realRevenue,
          currentProfit,
          realProfit,
          currentMargin,
          realMargin,
          profitDifference,
          marginDifference,
          hourlyRateCurrent,
          hourlyRateReal,
          status
        });

        totalRealRevenue += realRevenue;
        totalCurrentRevenue += currentRevenue;
        totalHours += currentHours;
        totalProfit += realProfit;
      }
    }

         const summary = {
       totalHours,
       totalCurrentRevenue,
       totalRealRevenue,
       totalProfit,
       averageMargin: totalRealRevenue > 0 ? (totalProfit / totalRealRevenue) * 100 : 0
     };

    return NextResponse.json({
      analysis,
      summary
    });
  } catch (error) {
    console.error('Failed to fetch profitability data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profitability data' },
      { status: 500 }
    );
  }
}
