import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, packageId, status, startDate } = body;

    if (!customerId || !packageId) {
      return NextResponse.json(
        { error: 'Customer ID and Package ID are required' },
        { status: 400 }
      );
    }

    const customerPackage = await prisma.customer_packages.create({
      data: {
        id: `${customerId}-${packageId}-${Date.now()}`,
        customerId,
        packageId,
        status: status || 'ACTIVE',
        startDate: startDate ? new Date(startDate) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        customers: {
          include: {
            users: true
          }
        },
        packages: true
      }
    });

    return NextResponse.json(customerPackage);
  } catch (error: any) {
    console.error('Failed to create customer package:', error);
    return NextResponse.json(
      { error: 'Failed to create customer package', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const customerPackages = await prisma.customer_packages.findMany({
      include: {
        customers: {
          include: {
            users: true
          }
        },
        packages: true
      },
      orderBy: [
        { customers: { company: 'asc' } },
        { packages: { name: 'asc' } }
      ]
    });

    return NextResponse.json(customerPackages);
  } catch (error: any) {
    console.error('Failed to fetch customer packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer packages', details: error.message },
      { status: 500 }
    );
  }
}

