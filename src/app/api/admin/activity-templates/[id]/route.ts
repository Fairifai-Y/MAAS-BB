import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, category, estimatedHours, sellingPrice, costPrice } = body;

    const activityTemplate = await prisma.activityTemplate.update({
      where: { id },
      data: {
        name,
        description,
        category,
        estimatedHours: parseFloat(estimatedHours),
        sellingPrice: parseFloat(sellingPrice) || 75,
        costPrice: costPrice !== undefined && costPrice !== null ? parseFloat(costPrice) : null
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if activity template is in use by any packages
    const packageActivities = await prisma.packageActivity.findMany({
      where: { activityTemplateId: id },
      include: {
        package: true,
        activityTemplate: true
      }
    });

    if (packageActivities.length > 0) {
      const packageNames = packageActivities.map(pa => pa.package.name).join(', ');
      return NextResponse.json(
        { 
          error: `Cannot delete activity template. It is currently used in ${packageActivities.length} package(s): ${packageNames}`,
          packages: packageNames
        }, 
        { status: 400 }
      );
    }

    // Safe to delete
    await prisma.activityTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Activity template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete activity template:', error);
    return NextResponse.json({ error: 'Failed to delete activity template' }, { status: 500 });
  }
} 