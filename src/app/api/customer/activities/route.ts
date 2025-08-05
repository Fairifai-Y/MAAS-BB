import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // For now, return sample data since authentication is not set up
    const sampleActivities = [
      {
        id: '1',
        description: 'Website onderhoud en updates',
        hours: 4,
        date: '2024-01-15T09:00:00Z',
        status: 'COMPLETED',
        employee: {
          user: {
            name: 'Jan Jansen'
          }
        }
      },
      {
        id: '2',
        description: 'Database optimalisatie',
        hours: 6,
        date: '2024-01-14T10:00:00Z',
        status: 'COMPLETED',
        employee: {
          user: {
            name: 'Piet Pietersen'
          }
        }
      },
      {
        id: '3',
        description: 'Security audit uitvoeren',
        hours: 8,
        date: '2024-01-13T08:00:00Z',
        status: 'PENDING',
        employee: {
          user: {
            name: 'Marie de Vries'
          }
        }
      },
      {
        id: '4',
        description: 'Backup systeem configureren',
        hours: 3,
        date: '2024-01-12T14:00:00Z',
        status: 'COMPLETED',
        employee: {
          user: {
            name: 'Jan Jansen'
          }
        }
      },
      {
        id: '5',
        description: 'Performance monitoring instellen',
        hours: 5,
        date: '2024-01-11T11:00:00Z',
        status: 'PENDING',
        employee: {
          user: {
            name: 'Piet Pietersen'
          }
        }
      }
    ];

    return NextResponse.json(sampleActivities);
  } catch (error) {
    console.error('Failed to fetch customer activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 