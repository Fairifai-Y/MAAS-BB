import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // For now, return sample data since authentication is not set up
    const sampleStats = {
      totalCustomers: 25,
      totalPackages: 5,
      activeSubscriptions: 18,
      totalHours: 156,
      totalRevenue: 12500,
      pendingActivities: 7
    };

    return NextResponse.json(sampleStats);
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 