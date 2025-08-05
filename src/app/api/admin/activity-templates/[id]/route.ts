import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = await context.params;
    const body = await request.json();
    const { name, description, category, estimatedHours } = body;

    const activityTemplate = await prisma.activityTemplate.update({
      where: { id: params.id },
      data: {
        name,
        description,
        category,
        estimatedHours: parseFloat(estimatedHours)
      }
    });

    return NextResponse.json(activityTemplate);
  } catch (error) {
    console.error('Failed to update activity template:', error);
    return NextResponse.json({ error: 'Failed to update activity template' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = await context.params;
    await prisma.activityTemplate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Activity template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete activity template:', error);
    return NextResponse.json({ error: 'Failed to delete activity template' }, { status: 500 });
  }
} 