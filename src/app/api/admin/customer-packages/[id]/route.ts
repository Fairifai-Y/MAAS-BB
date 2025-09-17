import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if customer package exists
    const customerPackage = await prisma.customer_packages.findUnique({
      where: { id },
      include: {
        packages: {
          select: { name: true }
        },
        customers: {
          select: { company: true }
        }
      }
    });

    if (!customerPackage) {
      return NextResponse.json(
        { error: 'Customer package assignment not found' },
        { status: 404 }
      );
    }

    // Check if there are any activities logged for this customer package
    const activitiesCount = await prisma.activity.count({
      where: { customerPackageId: id }
    });

    if (activitiesCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot remove package assignment. There are logged activities for this package.',
          hasActivities: true,
          activityCount: activitiesCount
        },
        { status: 400 }
      );
    }

    // Safe to delete - no activities logged
    await prisma.customer_packages.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: `Package "${customerPackage.packages.name}" successfully removed from customer "${customerPackage.customers.company}"`
    });
  } catch (error) {
    console.error('Failed to remove customer package assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove package assignment' },
      { status: 500 }
    );
  }
}
