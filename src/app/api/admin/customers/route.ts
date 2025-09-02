import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customers.findMany({
      include: {
        users: true,
        customer_packages: {
          include: {
            packages: true
          }
        }
      },
      orderBy: {
        company: 'asc'
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
