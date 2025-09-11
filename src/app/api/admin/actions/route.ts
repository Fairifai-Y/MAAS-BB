import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const actions = await prisma.action.findMany({
      include: {
        activity: {
          include: {
            customer_packages: {
              include: {
                customers: {
                  include: {
                    users: true
                  }
                }
              }
            }
          }
        },
        owner: {
          include: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Failed to fetch actions:', error);
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      packageActivityId,
      activityId, // Keep for backward compatibility
      ownerId,
      title,
      description,
      plannedHours,
      actualHours,
      status,
      dueDate
    } = body;

    // Validate required fields
    if ((!packageActivityId && !activityId) || !ownerId || !title || !plannedHours) {
      return NextResponse.json(
        { error: 'Missing required fields: packageActivityId (or activityId), ownerId, title, plannedHours' },
        { status: 400 }
      );
    }

    let activityIdToUse = activityId;

    // If packageActivityId is provided, we need to create an Activity first
    if (packageActivityId) {
      // Get package activity details
      const packageActivity = await prisma.packageActivity.findUnique({
        where: { id: packageActivityId },
        include: {
          package: true,
          activityTemplate: true
        }
      });

      if (!packageActivity) {
        return NextResponse.json(
          { error: 'Package activity not found' },
          { status: 404 }
        );
      }

      // Find the customer package for this package
      const customerPackage = await prisma.customer_packages.findFirst({
        where: { packageId: packageActivity.packageId }
      });

      if (!customerPackage) {
        return NextResponse.json(
          { error: 'No customer package found for this package activity' },
          { status: 404 }
        );
      }

      // Create a new Activity record
      const newActivity = await prisma.activity.create({
        data: {
          customerPackageId: customerPackage.id,
          employeeId: ownerId, // Use the owner as the employee
          description: title,
          hours: Number(plannedHours),
          date: new Date(),
          status: 'PENDING'
        }
      });

      activityIdToUse = newActivity.id;
    }

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityIdToUse }
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if owner exists
    const owner = await prisma.employees.findUnique({
      where: { id: ownerId }
    });

    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    const action = await prisma.action.create({
      data: {
        activityId: activityIdToUse,
        ownerId,
        title,
        description: description || null,
        plannedHours: Number(plannedHours),
        actualHours: actualHours ? Number(actualHours) : null,
        status: status || 'PLANNED',
        dueDate: dueDate ? new Date(dueDate) : null,
        updatedAt: new Date()
      },
      include: {
        activity: {
          include: {
            customer_packages: {
              include: {
                customers: {
                  include: {
                    users: true
                  }
                }
              }
            }
          }
        },
        owner: {
          include: {
            users: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Action created successfully', 
      action 
    });
  } catch (error: any) {
    console.error('Failed to create action:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Action already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create action', details: error.message },
      { status: 500 }
    );
  }
}
