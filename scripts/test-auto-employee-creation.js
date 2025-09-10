const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAutoEmployeeCreation() {
  try {
    console.log('🧪 Testing automatic employee record creation...\n');

    // Check current state
    const users = await prisma.user.findMany({
      include: {
        employees: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Current users: ${users.length}`);
    console.log(`👥 Current employees: ${users.filter(u => u.employees).length}\n`);

    // Show users without employee records
    const usersWithoutEmployee = users.filter(user => !user.employees);
    if (usersWithoutEmployee.length > 0) {
      console.log('⚠️  Users without employee records:');
      usersWithoutEmployee.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      console.log('');
    }

    // Test the sync-user endpoint logic
    console.log('🔄 Testing sync-user logic for users without employee records...\n');

    for (const user of usersWithoutEmployee) {
      try {
        // Check if employee record exists
        const existingEmployee = await prisma.employees.findUnique({
          where: { userId: user.id }
        });

        if (!existingEmployee) {
          // Create employee record (simulating sync-user endpoint)
          const newEmployee = await prisma.employees.create({
            data: {
              id: user.id,
              userId: user.id,
              hourlyRate: 0, // Default rate, can be updated later
              contractHours: 40,
              isActive: true,
              function: user.role === 'ADMIN' ? 'Admin' : 'Medewerker',
              department: user.role === 'ADMIN' ? 'Management' : 'Operations',
              internalHourlyRate: 0, // Default rate, can be updated later
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          console.log(`✅ Created employee record for: ${user.name} (${user.email})`);
          console.log(`   - Function: ${newEmployee.function}`);
          console.log(`   - Department: ${newEmployee.department}`);
          console.log(`   - Active: ${newEmployee.isActive}\n`);
        }
      } catch (error) {
        console.error(`❌ Error creating employee record for ${user.name}:`, error.message);
      }
    }

    // Final check
    const finalUsers = await prisma.user.findMany({
      include: {
        employees: true
      }
    });

    const finalEmployees = finalUsers.filter(u => u.employees);
    console.log(`🎉 Final result:`);
    console.log(`   - Total users: ${finalUsers.length}`);
    console.log(`   - Users with employee records: ${finalEmployees.length}`);
    console.log(`   - Users without employee records: ${finalUsers.length - finalEmployees.length}`);

    if (finalUsers.length === finalEmployees.length) {
      console.log(`\n✅ SUCCESS: All users now have employee records!`);
    } else {
      console.log(`\n⚠️  Some users still don't have employee records.`);
    }

  } catch (error) {
    console.error('❌ Error testing auto employee creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutoEmployeeCreation();
