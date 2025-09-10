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

    // Get actions for this employee
    const actions = await prisma.action.findMany({
      where: {
        ownerId: employee.id
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
    const { activityId, title, description, plannedHours, actualHours, status, dueDate } = body;

    // Create new action
    const action = await prisma.action.create({
      data: {
        activityId,
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
