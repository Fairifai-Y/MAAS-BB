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
            category: true,
            estimatedHours: true
          }
        }
      },
      orderBy: [
        { package: { name: 'asc' } },
        { activityTemplate: { name: 'asc' } }
      ]
    });

    return NextResponse.json(packageActivities);
  } catch (error) {
    console.error('Failed to fetch package activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, activityTemplateId, quantity = 1 } = body;

    // Check if the package activity already exists
    const existingActivity = await prisma.packageActivity.findUnique({
      where: {
        packageId_activityTemplateId: {
          packageId,
          activityTemplateId
        }
      }
    });

    if (existingActivity) {
      // Update existing activity
      const updatedActivity = await prisma.packageActivity.update({
        where: {
          id: existingActivity.id
        },
        data: {
          quantity: quantity
        },
        include: {
          package: {
            select: {
              name: true
            }
          },
          activityTemplate: {
            select: {
              name: true,
              category: true,
              estimatedHours: true
            }
          }
        }
      });

      return NextResponse.json(updatedActivity);
    } else {
      // Create new activity
      const newActivity = await prisma.packageActivity.create({
        data: {
          packageId,
          activityTemplateId,
          quantity
        },
        include: {
          package: {
            select: {
              name: true
            }
          },
          activityTemplate: {
            select: {
              name: true,
              category: true,
              estimatedHours: true
            }
          }
        }
      });

      return NextResponse.json(newActivity);
    }
  } catch (error) {
    console.error('Failed to create/update package activity:', error);
    return NextResponse.json(
      { error: 'Failed to create/update package activity' },
      { status: 500 }
    );
  }
} 