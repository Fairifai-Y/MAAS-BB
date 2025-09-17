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
      // If quantity is set to 0, decide whether to delete or keep based on existing activities
      if (quantity === 0) {
        // Approximation: if there are no activities logged for the package, delete the package-activity
        const hasAnyActivitiesForPackage = await prisma.activity.count({
          where: {
            customer_packages: {
              packageId
            }
          }
        });

        if (hasAnyActivitiesForPackage === 0) {
          await prisma.packageActivity.delete({
            where: { id: existingActivity.id }
          });
          return NextResponse.json({ deleted: true });
        }
        // Else: fall through to update to quantity 0 to keep history
      }

      // Update existing activity (including setting quantity to 0 when there is history)
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