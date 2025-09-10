const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminEmployee() {
  try {
    console.log('🔍 Looking for Admin User...');

    // Find Admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@fitchannel.com' }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found');
      return;
    }

    console.log('✅ Found Admin user:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      clerkId: adminUser.clerkId
    });

    // Check if employee record already exists
    const existingEmployee = await prisma.employees.findUnique({
      where: { userId: adminUser.id }
    });

    if (existingEmployee) {
      console.log('✅ Employee record already exists:', {
        id: existingEmployee.id,
        userId: existingEmployee.userId,
        hourlyRate: existingEmployee.hourlyRate,
        isActive: existingEmployee.isActive
      });
      return;
    }

    // Create employee record for Admin
    const newEmployee = await prisma.employees.create({
      data: {
        id: adminUser.id, // Use same ID as user
        userId: adminUser.id,
        hourlyRate: 100, // Set a reasonable hourly rate for admin
        contractHours: 40,
        isActive: true,
        function: 'Admin',
        department: 'Management',
        internalHourlyRate: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Created employee record for Admin:', {
      id: newEmployee.id,
      userId: newEmployee.userId,
      hourlyRate: newEmployee.hourlyRate,
      contractHours: newEmployee.contractHours,
      isActive: newEmployee.isActive,
      function: newEmployee.function,
      department: newEmployee.department,
      internalHourlyRate: newEmployee.internalHourlyRate
    });

  } catch (error) {
    console.error('❌ Error creating employee record:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminEmployee();
