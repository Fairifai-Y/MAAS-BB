const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTempClerkUser() {
  console.log('🔧 Fixing temporary Clerk user...\n');

  try {
    // Find user with temp Clerk ID
    const tempUser = await prisma.user.findFirst({
      where: {
        clerkId: {
          startsWith: 'temp_'
        }
      }
    });

    if (!tempUser) {
      console.log('✅ No users with temporary Clerk IDs found');
      return;
    }

    console.log(`👤 Found user with temp Clerk ID: ${tempUser.email} (${tempUser.clerkId})`);

    // Check if user has employee record
    const existingEmployee = await prisma.employees.findUnique({
      where: { userId: tempUser.id }
    });

    if (!existingEmployee && tempUser.userType === 'EMPLOYEE') {
      console.log('🔧 Creating employee record for temp user...');
      
      await prisma.employees.create({
        data: {
          id: tempUser.id,
          userId: tempUser.id,
          hourlyRate: 0,
          contractHours: 40,
          isActive: true,
          function: 'Medewerker',
          department: 'Operations',
          internalHourlyRate: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Employee record created');
    } else if (existingEmployee) {
      console.log('✅ Employee record already exists');
    } else {
      console.log('ℹ️  User is not an employee, no employee record needed');
    }

    // Update the user to mark as processed
    await prisma.user.update({
      where: { id: tempUser.id },
      data: {
        clerkId: `processed_${tempUser.clerkId}`,
        updatedAt: new Date()
      }
    });

    console.log('✅ User marked as processed');

  } catch (error) {
    console.error('❌ Error fixing temp Clerk user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTempClerkUser();
