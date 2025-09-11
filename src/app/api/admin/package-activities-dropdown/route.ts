import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
        // Alleen actieve klanten
        package: {
          customer_packages: {
            some: {
              customers: {
                isActive: true
              }
            }
          }
        }
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
    console.error('Failed to fetch package activities for dropdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package activities' },
      { status: 500 }
    );
  }
}
