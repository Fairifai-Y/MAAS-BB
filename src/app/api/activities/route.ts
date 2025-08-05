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
    const customerPackageId = searchParams.get('customerPackageId');
    const employeeId = searchParams.get('employeeId');

    const where: any = {};
    if (customerPackageId) where.customerPackageId = customerPackageId;
    if (employeeId) where.employeeId = employeeId;

    const activities = await prisma.activity.findMany({
      where,
      include: {
        customerPackage: {
          include: {
            customer: {
              include: { user: true }
            },
            package: true
          }
        },
        employee: {
          include: { user: true }
        }
      },
      orderBy: { date: 'desc' }
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
    const { customerPackageId, description, hours, date, rompslompTaskId } = body;

    // Get employee ID from user
    const employee = await prisma.employee.findUnique({
      where: { userId: userId }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        customerPackageId,
        employeeId: employee.id,
        description,
        hours,
        date: new Date(date),
        rompslompTaskId
      },
      include: {
        customerPackage: {
          include: {
            customer: { include: { user: true } },
            package: true
          }
        },
        employee: { include: { user: true } }
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