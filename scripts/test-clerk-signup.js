const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testClerkSignup() {
  console.log('🧪 Testing Clerk Signup Flow...\n');

  try {
    // 1. Check current user count
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);

    // 2. Check employee count
    const employeeCount = await prisma.employees.count();
    console.log(`👥 Current employees in database: ${employeeCount}`);

    // 3. Show recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      take: 10,
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
    const usersWithoutType = await prisma.user.count({
      where: { userType: null }
    });

    if (usersWithoutType > 0) {
      console.log(`⚠️  ${usersWithoutType} users without userType`);
    } else {
      console.log('✅ All users have userType set');
    }

    // 5. Check for internal users without employee records
    const internalUsersWithoutEmployee = await prisma.user.count({
      where: {
        OR: [
          { userType: 'EMPLOYEE' },
          { userType: 'ADMIN' }
        ],
        employees: null
      }
    });

    if (internalUsersWithoutEmployee > 0) {
      console.log(`⚠️  ${internalUsersWithoutEmployee} internal users without employee records`);
    } else {
      console.log('✅ All internal users have employee records');
    }

    // 6. Check for users with temp Clerk IDs
    const tempUsers = await prisma.user.findMany({
      where: {
        clerkId: {
          startsWith: 'temp_'
        }
      },
      select: { id: true, email: true, clerkId: true, createdAt: true }
    });

    if (tempUsers.length > 0) {
      console.log('\n⚠️  Users with temporary Clerk IDs:');
      tempUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.clerkId}) - Created: ${user.createdAt.toISOString()}`);
      });
    } else {
      console.log('\n✅ No users with temporary Clerk IDs');
    }

    console.log('\n✅ Clerk signup flow test completed!');

  } catch (error) {
    console.error('❌ Error testing Clerk signup flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testClerkSignup();
