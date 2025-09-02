import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employees.findMany({
      include: {
        users: true
      },
      orderBy: {
        users: {
          name: 'asc'
        }
      }
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
