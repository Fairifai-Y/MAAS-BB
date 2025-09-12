const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRegistrationFlow() {
  console.log('🧪 Testing Registration Flow...\n');

  try {
    // 1. Check current user count
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);

    // 2. Check employee count
    const employeeCount = await prisma.employees.count();
    console.log(`👥 Current employees in database: ${employeeCount}`);

    // 3. Show recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        employees: true
      }
    });

    console.log('\n📋 Recent users:');
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   - Clerk ID: ${user.clerkId}`);
      console.log(`   - User Type: ${user.userType || 'Not set'}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Is Internal: ${user.isInternal}`);
      console.log(`   - Employee Record: ${user.employees ? 'Yes' : 'No'}`);
      console.log(`   - Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    // 4. Check for users without userType
    const usersWithoutType = await prisma.user.findMany({
      where: { userType: null },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    if (usersWithoutType.length > 0) {
      console.log('⚠️  Users without userType:');
      usersWithoutType.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Created: ${user.createdAt.toISOString()}`);
      });
    }

    // 5. Check for internal users without employee records
    const internalUsersWithoutEmployee = await prisma.user.findMany({
      where: {
        OR: [
          { userType: 'EMPLOYEE' },
          { userType: 'ADMIN' }
        ],
        employees: null
      },
      select: { id: true, email: true, name: true, userType: true }
    });

    if (internalUsersWithoutEmployee.length > 0) {
      console.log('\n⚠️  Internal users without employee records:');
      internalUsersWithoutEmployee.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Type: ${user.userType}`);
      });
    }

    console.log('\n✅ Registration flow test completed!');

  } catch (error) {
    console.error('❌ Error testing registration flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegistrationFlow();
