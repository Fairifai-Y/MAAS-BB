import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, email, name, phone, address, isActive } = body;

    if (!company || !email || !name) {
      return NextResponse.json(
        { error: 'Company, email, and name are required' },
        { status: 400 }
      );
    }

    // For customers, we allow any email domain (no restriction)
    // Only employees need to use specific domains

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

    // Create new user and customer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new user
      const newUser = await tx.user.create({
        data: {
          clerkId: `temp_${Date.now()}`, // Temporary ID, should be replaced with actual Clerk ID
          email,
          name,
          role: 'CUSTOMER'
        }
      });

      // Create new customer
      const newCustomer = await tx.customers.create({
        data: {
          id: newUser.id, // Use the same ID as the user
          userId: newUser.id,
          company,
          phone: phone || '',
          address: address || '',
          isActive: isActive !== false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Never auto-create a default package; customers will only use composed packages

      return { user: newUser, customer: newCustomer };
    });

    // Fetch the complete customer data with includes
    const completeCustomer = await prisma.customers.findUnique({
      where: { id: result.customer.id },
      include: {
        users: true,
        customer_packages: {
          include: {
            packages: true
          }
        }
      }
    });

    return NextResponse.json(completeCustomer, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create customer:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A customer with this information already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer', details: error.message },
      { status: 500 }
    );
  }
}
