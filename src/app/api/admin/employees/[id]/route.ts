import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔄 Updating employee with ID:', id);
    
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    const {
      name,
      email,
      hourlyRate,
      contractHours,
      isActive,
      function: employeeFunction,
      department,
      internalHourlyRate,
      documentUrl
    } = body;

    // Validate required fields
    if (!name || !email) {
      console.error('❌ Missing required fields: name or email');
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const existingEmployee = await prisma.employees.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!existingEmployee) {
      console.error('❌ Employee not found with ID:', id);
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    console.log('📋 Existing employee:', {
      id: existingEmployee.id,
      name: existingEmployee.users.name,
      email: existingEmployee.users.email,
      hourlyRate: existingEmployee.hourlyRate,
      contractHours: existingEmployee.contractHours
    });

    // Update employee data
    const employeeData = {
      hourlyRate: Number(hourlyRate) || 0,
      contractHours: Number(contractHours) || 0,
      isActive: isActive !== false,
      function: employeeFunction || null,
      department: department || null,
      internalHourlyRate: internalHourlyRate ? Number(internalHourlyRate) : null,
      documentUrl: documentUrl || null,
      updatedAt: new Date()
    };
    
    console.log('🔄 Updating employee data:', employeeData);
    
    const updatedEmployee = await prisma.employees.update({
      where: { id },
      data: employeeData,
      include: {
        users: true
      }
    });

    console.log('✅ Employee update successful:', {
      id: updatedEmployee.id,
      hourlyRate: updatedEmployee.hourlyRate,
      contractHours: updatedEmployee.contractHours
    });

    // Update user data separately
    const userData = {
      name: String(name),
      email: String(email)
    };
    
    console.log('🔄 Updating user data:', userData);
    
    const updatedUser = await prisma.user.update({
      where: { id: existingEmployee.userId },
      data: userData
    });

    console.log('✅ User update successful:', {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    });

    console.log('✅ Employee updated successfully:', {
      id: updatedEmployee.id,
      name: updatedUser.name,
      email: updatedUser.email,
      hourlyRate: updatedEmployee.hourlyRate,
      contractHours: updatedEmployee.contractHours
    });

    return NextResponse.json({ 
      message: 'Employee updated successfully',
      employee: {
        ...updatedEmployee,
        users: updatedUser
      }
    });
  } catch (error: any) {
    console.error('❌ Failed to update employee:', error);
    
    // Return more specific error information
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Handle Prisma validation errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Handle other Prisma errors
    if (error.code) {
      return NextResponse.json(
        { error: 'Database error', code: error.code, details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update employee', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Deleting employee with ID:', id);

    // First, get the employee to find related data
    const employee = await prisma.employees.findUnique({
      where: { id },
      include: {
        users: true,
        activities: true
      }
    });

    if (!employee) {
      console.error('❌ Employee not found with ID:', id);
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    console.log('📋 Employee to delete:', {
      id: employee.id,
      name: employee.users.name,
      userId: employee.userId,
      activities: employee.activities.length
    });

    // Delete in the correct order to avoid foreign key constraints
    // 1. Delete activities associated with the employee
    if (employee.activities.length > 0) {
      await prisma.activity.deleteMany({
        where: { employeeId: id }
      });
      console.log(`   ✅ Deleted ${employee.activities.length} activities`);
    }

    // 2. Delete the employee
    await prisma.employees.delete({
      where: { id }
    });
    console.log('   ✅ Deleted employee');

    // 3. Delete the associated user
    await prisma.user.delete({
      where: { id: employee.userId }
    });
    console.log('   ✅ Deleted user');

    console.log('✅ Employee deleted successfully:', {
      id: employee.id,
      name: employee.users.name,
      email: employee.users.email
    });

    return NextResponse.json({ 
      message: 'Employee deleted successfully',
      deletedEmployee: {
        id: employee.id,
        name: employee.users.name,
        email: employee.users.email
      }
    });
  } catch (error: any) {
    console.error('❌ Failed to delete employee:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    if (error.code) {
      return NextResponse.json({ 
        error: 'Database error', 
        code: error.code, 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete employee', 
      details: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}
