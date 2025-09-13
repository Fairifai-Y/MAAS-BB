import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get employee record
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get actions for this employee - only current month for dashboard
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const actions = await prisma.action.findMany({
      where: {
        ownerId: employee.id,
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth
        }
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Failed to fetch employee actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get employee record
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { 
      packageActivityId, 
      activityId, // Keep for backward compatibility
      title, 
      description, 
      plannedHours, 
      actualHours, 
      status, 
      dueDate 
    } = body;

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
          employeeId: employee.id,
          description: title,
          hours: Number(plannedHours),
          date: new Date(),
          status: 'PENDING'
        }
      });

      activityIdToUse = newActivity.id;
    }

    // Create new action
    const action = await prisma.action.create({
      data: {
        activityId: activityIdToUse,
        ownerId: employee.id,
        title,
        description,
        plannedHours: Number(plannedHours),
        actualHours: actualHours ? Number(actualHours) : null,
        status: status || 'PLANNED',
        dueDate: dueDate ? new Date(dueDate) : null
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
        }
      }
    });

    return NextResponse.json(action);
  } catch (error) {
    console.error('Failed to create action:', error);
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    );
  }
}
