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

    // Get packages for the authenticated user
    const packages = await prisma.package.findMany({
      where: { userId },
      include: {
        packageActivities: {
          include: {
            activityTemplate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Failed to fetch customer packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
} 