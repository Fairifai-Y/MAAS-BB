import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const packageActivities = await prisma.packageActivity.findMany({
      include: {
        package: {
          select: {
            name: true
          }
        },
        activityTemplate: {
          select: {
            name: true,
            description: true,
            category: true,
            estimatedHours: true
          }
        }
      },
      where: {
        // Alleen activiteiten van de geselecteerde klant
        package: {
          customer_packages: {
            some: {
              customerId: customerId,
              customers: {
                isActive: true
              }
            }
          }
        },
        // Verberg records met quantity == 0
        quantity: { gt: 0 }
      },
      orderBy: [
        { package: { name: 'asc' } },
        { activityTemplate: { name: 'asc' } }
      ]
    });

    // Transform data for dropdown use
    const dropdownData = packageActivities.map(pa => ({
      id: pa.id,
      packageName: pa.package.name,
      activityName: pa.activityTemplate.name,
      description: pa.activityTemplate.description,
      category: pa.activityTemplate.category,
      estimatedHours: pa.activityTemplate.estimatedHours,
      quantity: pa.quantity,
      displayName: `${pa.package.name} - ${pa.activityTemplate.name} (${pa.quantity}x)`
    }));

    return NextResponse.json(dropdownData);
  } catch (error) {
    console.error('Failed to fetch customer package activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer package activities' },
      { status: 500 }
    );
  }
}
