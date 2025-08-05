import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, maxHours, price, isActive } = body;

    const package_ = await prisma.package.update({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.package.delete({
      where: { id: params.id }
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