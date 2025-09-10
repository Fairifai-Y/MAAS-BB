import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get employee record
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if action exists and belongs to this employee
    const existingAction = await prisma.action.findFirst({
      where: {
        id: id,
        ownerId: employee.id
      }
    });

    if (!existingAction) {
      return NextResponse.json(
        { error: 'Action not found or not authorized' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, plannedHours, actualHours, status, dueDate, completedAt } = body;

    // Update action
    const updatedAction = await prisma.action.update({
      where: { id },
      data: {
        title,
        description,
        plannedHours: Number(plannedHours),
        actualHours: actualHours ? Number(actualHours) : null,
        status: status || 'PLANNED',
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        updatedAt: new Date()
      },
      include: {
        activity: {
          include: {
            customer_packages: {
              include: {
                customers: {
                  include: {
                    users: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedAction);
  } catch (error) {
    console.error('Failed to update action:', error);
    return NextResponse.json(
      { error: 'Failed to update action' },
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

    // Get employee record
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if action exists and belongs to this employee
    const existingAction = await prisma.action.findFirst({
      where: {
        id: id,
        ownerId: employee.id
      }
    });

    if (!existingAction) {
      return NextResponse.json(
        { error: 'Action not found or not authorized' },
        { status: 404 }
      );
    }

    // Delete action
    await prisma.action.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Action deleted successfully' });
  } catch (error) {
    console.error('Failed to delete action:', error);
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    );
  }
}
