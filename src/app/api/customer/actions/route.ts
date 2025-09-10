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

    // Get customer record
    const customer = await prisma.customers.findUnique({
      where: { userId: user.id }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get actions for this customer through activities
    const actions = await prisma.action.findMany({
      where: {
        activity: {
          customer_packages: {
            customerId: customer.id
          }
        }
      },
      include: {
        owner: {
          include: {
            users: true
          }
        },
        activity: {
          include: {
            customer_packages: {
              include: {
                customers: true
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
    console.error('Failed to fetch customer actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    );
  }
}
