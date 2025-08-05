import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activityTemplates = await prisma.activityTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(activityTemplates);
  } catch (error) {
    console.error('Failed to fetch activity templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, estimatedHours } = body;

    const activityTemplate = await prisma.activityTemplate.create({
      data: {
        name,
        description,
        category,
        estimatedHours
      }
    });

    return NextResponse.json(activityTemplate);
  } catch (error) {
    console.error('Failed to create activity template:', error);
    return NextResponse.json(
      { error: 'Failed to create activity template' },
      { status: 500 }
    );
  }
} 