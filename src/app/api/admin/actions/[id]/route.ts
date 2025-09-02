import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      title,
      description,
      plannedHours,
      actualHours,
      status,
      dueDate,
      completedAt
    } = body;

    // Check if action exists
    const existingAction = await prisma.action.findUnique({
      where: { id }
    });

    if (!existingAction) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      );
    }

    const updatedAction = await prisma.action.update({
      where: { id },
      data: {
        title: title || existingAction.title,
        description: description !== undefined ? description : existingAction.description,
        plannedHours: plannedHours ? Number(plannedHours) : existingAction.plannedHours,
        actualHours: actualHours !== undefined ? (actualHours ? Number(actualHours) : null) : existingAction.actualHours,
        status: status || existingAction.status,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingAction.dueDate,
        completedAt: completedAt !== undefined ? (completedAt ? new Date(completedAt) : null) : existingAction.completedAt,
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
        },
        owner: {
          include: {
            users: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Action updated successfully', 
      action: updatedAction 
    });
  } catch (error: any) {
    console.error('Failed to update action:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update action', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if action exists
    const action = await prisma.action.findUnique({
      where: { id },
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
        },
        owner: {
          include: {
            users: true
          }
        }
      }
    });

    if (!action) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      );
    }

    // Delete the action
    await prisma.action.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Action deleted successfully',
      deletedAction: {
        id: action.id,
        title: action.title,
        activity: action.activity.customer_packages.customers.company,
        owner: action.owner.users.name
      }
    });
  } catch (error: any) {
    console.error('Failed to delete action:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete action', details: error.message },
      { status: 500 }
    );
  }
}
