import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { price: 'asc' }
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, maxHours, price } = body;

    const package_ = await prisma.package.create({
      data: {
        name,
        description,
        maxHours,
        price
      }
    });

    return NextResponse.json(package_);
  } catch (error) {
    console.error('Failed to create package:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
} 