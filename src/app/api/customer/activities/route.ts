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

    // Get customer activities for the authenticated user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        customers: {
          include: {
            customer_packages: {
              include: {
                activities: {
                  include: {
                    employees: {
                      include: {
                        users: true
                      }
                    }
                  },
                  orderBy: {
                    date: 'desc'
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user?.customers) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Flatten all activities from all customer packages
    const allActivities = user.customers.customer_packages.flatMap(cp => 
      cp.activities.map(activity => ({
        id: activity.id,
        description: activity.description,
        hours: activity.hours,
        date: activity.date.toISOString(),
        status: activity.status,
        employee: {
          user: {
            name: activity.employees.users.name
          }
        }
      }))
    );

    return NextResponse.json(allActivities);
  } catch (error) {
    console.error('Failed to fetch customer activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 