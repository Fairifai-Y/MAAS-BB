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

    // Get customer packages for the authenticated user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        customers: {
          include: {
            customer_packages: {
              include: {
                packages: {
                  include: {
                    packageActivities: {
                      include: {
                        activityTemplate: true
                      }
                    }
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

    return NextResponse.json(user.customers.customer_packages);
  } catch (error) {
    console.error('Failed to fetch customer packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
} 