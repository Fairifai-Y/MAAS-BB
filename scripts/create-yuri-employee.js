const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createYuriEmployee() {
  try {
    console.log('🔍 Looking for Yuri user...');

    // Find Yuri user
    const yuriUser = await prisma.user.findUnique({
      where: { email: 'yuri@fitchannel.com' }
    });

    if (!yuriUser) {
      console.error('❌ Yuri user not found');
      return;
    }

    console.log('✅ Found Yuri user:', {
      id: yuriUser.id,
      name: yuriUser.name,
      email: yuriUser.email,
      role: yuriUser.role,
      clerkId: yuriUser.clerkId
    });

    // Check if employee record already exists
    const existingEmployee = await prisma.employees.findUnique({
      where: { userId: yuriUser.id }
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

    // Create employee record for Yuri
    const newEmployee = await prisma.employees.create({
      data: {
        id: yuriUser.id, // Use same ID as user
        userId: yuriUser.id,
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

    console.log('✅ Created employee record for Yuri:', {
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

createYuriEmployee();
