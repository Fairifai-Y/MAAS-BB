import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { company, email, name, phone, address, price, maxHours, isActive } = body;

    const updatedCustomer = await prisma.customers.update({
      where: { id },
      data: {
        company, phone, address, isActive, updatedAt: new Date(),
        users: { update: { email, name } }
      },
      include: { users: true, customer_packages: { include: { packages: true } } }
    });

    if (updatedCustomer.customer_packages.length > 0) {
      const customerPackage = updatedCustomer.customer_packages[0];
      await prisma.package.update({
        where: { id: customerPackage.packageId },
        data: { price: Number(price), maxHours: Number(maxHours) }
      });
    }

    return NextResponse.json({ message: 'Customer updated successfully', customer: updatedCustomer });
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Deleting customer with ID:', id);

    // First, get the customer to find related data
    const customer = await prisma.customers.findUnique({
      where: { id },
      include: {
        users: true,
        customer_packages: {
          include: {
            packages: true,
            activities: true
          }
        }
      }
    });

    if (!customer) {
      console.error('❌ Customer not found with ID:', id);
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    console.log('📋 Customer to delete:', {
      id: customer.id,
      company: customer.company,
      userId: customer.userId,
      customerPackages: customer.customer_packages.length
    });

    // Delete in the correct order to avoid foreign key constraints
    // 1. Delete activities associated with customer packages
    for (const cp of customer.customer_packages) {
      if (cp.activities.length > 0) {
        await prisma.activity.deleteMany({
          where: { customerPackageId: cp.id }
        });
        console.log(`   ✅ Deleted ${cp.activities.length} activities for package ${cp.id}`);
      }
    }

    // 2. Delete customer packages
    await prisma.customer_packages.deleteMany({
      where: { customerId: id }
    });
    console.log(`   ✅ Deleted ${customer.customer_packages.length} customer packages`);

    // 3. Delete packages (orphaned packages)
    for (const cp of customer.customer_packages) {
      await prisma.package.delete({
        where: { id: cp.packageId }
      });
      console.log(`   ✅ Deleted package ${cp.packageId}`);
    }

    // 4. Delete the customer
    await prisma.customers.delete({
      where: { id }
    });
    console.log('   ✅ Deleted customer');

    // 5. Delete the associated user
    await prisma.user.delete({
      where: { id: customer.userId }
    });
    console.log('   ✅ Deleted user');

    console.log('✅ Customer deleted successfully:', {
      id: customer.id,
      company: customer.company,
      name: customer.users.name
    });

    return NextResponse.json({ 
      message: 'Customer deleted successfully',
      deletedCustomer: {
        id: customer.id,
        company: customer.company,
        name: customer.users.name
      }
    });
  } catch (error: any) {
    console.error('❌ Failed to delete customer:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    if (error.code) {
      return NextResponse.json({ 
        error: 'Database error', 
        code: error.code, 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete customer', 
      details: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}
