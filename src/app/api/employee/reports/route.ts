import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, 3months, 6months, 1year
    const type = searchParams.get('type') || 'actions'; // actions, activities

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date | undefined;
    
    switch (period) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'all':
      default:
        startDate = undefined;
    }

    if (type === 'actions') {
      // Get all actions for this employee (with optional date filter)
      const whereClause: any = {
        ownerId: employee.id
      };

      if (startDate) {
        whereClause.createdAt = {
          gte: startDate
        };
      }

      const actions = await prisma.action.findMany({
        where: whereClause,
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
    } else {
      // Get all activities for this employee (with optional date filter)
      const whereClause: any = {
        employeeId: employee.id
      };

      if (startDate) {
        whereClause.createdAt = {
          gte: startDate
        };
      }

      const activities = await prisma.activity.findMany({
        where: whereClause,
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json(activities);
    }
  } catch (error) {
    console.error('Failed to fetch employee reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
