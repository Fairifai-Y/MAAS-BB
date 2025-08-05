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

    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('packageId');
    const userIdParam = searchParams.get('userId');

    const where: any = {};
    if (packageId) where.packageId = packageId;
    if (userIdParam) where.userId = userIdParam;

    const activities = await prisma.activity.findMany({
      where,
      include: {
        package: true,
        user: true,
        activityTemplate: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
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

    const body = await request.json();
    const { packageId, activityTemplateId, notes, hoursSpent } = body;

    const activity = await prisma.activity.create({
      data: {
        userId,
        packageId,
        activityTemplateId,
        notes,
        hoursSpent: hoursSpent || 0,
        status: 'PENDING'
      },
      include: {
        package: true,
        user: true,
        activityTemplate: true
      }
    });

    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
} 