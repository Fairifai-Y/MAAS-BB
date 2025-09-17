import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, maxHours, price, isActive } = body;

    const package_ = await prisma.package.update({
      where: { id },
      data: {
        name,
        description,
        maxHours,
        price,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(package_);
  } catch (error) {
    console.error('Failed to update package:', error);
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if package has any activities
    const packageActivities = await prisma.packageActivity.findMany({
      where: { packageId: id }
    });

    if (packageActivities.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete package. It contains activities. Please remove all activities first.',
          hasActivities: true,
          activityCount: packageActivities.length
        },
        { status: 400 }
      );
    }

    // Check if package is assigned to any customers
    const customerPackages = await prisma.customer_packages.findMany({
      where: { packageId: id }
    });

    if (customerPackages.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete package. It is assigned to customers. Please remove customer assignments first.',
          hasCustomers: true,
          customerCount: customerPackages.length
        },
        { status: 400 }
      );
    }

    // Safe to delete - package is empty
    await prisma.package.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
} 