import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity } = body;

    const updatedActivity = await prisma.packageActivity.update({
      where: {
        id: params.id
      },
      data: {
        quantity: Math.max(0, quantity) // Ensure quantity is not negative
      },
      include: {
        package: {
          select: {
            name: true
          }
        },
        activityTemplate: {
          select: {
            name: true,
            category: true,
            estimatedHours: true
          }
        }
      }
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Failed to update package activity:', error);
    return NextResponse.json(
      { error: 'Failed to update package activity' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.packageActivity.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete package activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete package activity' },
      { status: 500 }
    );
  }
} 