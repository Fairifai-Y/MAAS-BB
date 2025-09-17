import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customers.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        company: true,
        users: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        company: 'asc'
      }
    });

    // Transform data for dropdown use
    const dropdownData = customers.map(customer => ({
      id: customer.id,
      company: customer.company,
      contactName: customer.users?.name || 'Geen contact',
      contactEmail: customer.users?.email || 'Geen email',
      displayName: `${customer.company} (${customer.users?.name || 'Geen contact'})`
    }));

    return NextResponse.json(dropdownData);
  } catch (error) {
    console.error('Failed to fetch customers for dropdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
