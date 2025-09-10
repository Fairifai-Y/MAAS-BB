import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, hourlyRate, contractHours, isActive } = body;

    if (!name || !email || !hourlyRate || !contractHours) {
      return NextResponse.json(
        { error: 'Name, email, hourly rate, and contract hours are required' },
        { status: 400 }
      );
    }

    // Validate email domain - only allow @fitchannel.com
    if (!email.endsWith('@fitchannel.com')) {
      return NextResponse.json(
        { error: 'Only @fitchannel.com email addresses are allowed' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user and employee in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new user
      const newUser = await tx.user.create({
        data: {
          clerkId: `temp_${Date.now()}`, // Temporary ID, should be replaced with actual Clerk ID
          email,
          name,
          role: 'EMPLOYEE'
        }
      });

      // Create new employee
      const newEmployee = await tx.employees.create({
        data: {
          id: newUser.id, // Use the same ID as the user
          userId: newUser.id,
          hourlyRate: Number(hourlyRate),
          contractHours: Number(contractHours),
          isActive: isActive !== false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return { user: newUser, employee: newEmployee };
    });

    // Fetch the complete employee data with includes
    const completeEmployee = await prisma.employees.findUnique({
      where: { id: result.employee.id },
      include: {
        users: true
      }
    });

    return NextResponse.json(completeEmployee, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create employee:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An employee with this information already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create employee', details: error.message },
      { status: 500 }
    );
  }
}
