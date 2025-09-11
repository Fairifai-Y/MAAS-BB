import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { reason } = await request.json();
    const { id } = await params;
    
    // 1. Markeer customer_packages als gecanceld
    await prisma.customer_packages.updateMany({
      where: { customerId: id },
      data: { 
        status: 'CANCELLED',
        endDate: new Date()
      }
    });

    // 2. Markeer customer als inactief (niet meer in dropdown)
    await prisma.customers.update({
      where: { id: id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Customer cancelled successfully',
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('Failed to cancel customer:', error);
    return NextResponse.json(
      { error: 'Failed to cancel customer' },
      { status: 500 }
    );
  }
}
