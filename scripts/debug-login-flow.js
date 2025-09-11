const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugLoginFlow() {
  try {
    console.log('🔍 Debugging login flow...\n');

    // Check all users and their status
    const users = await prisma.user.findMany({
      include: {
        employees: true,
        customers: true,
        admins: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total users in database: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Clerk ID: ${user.clerkId}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - User Type: ${user.userType}`);
      console.log(`   - Is Internal: ${user.isInternal}`);
      console.log(`   - Created: ${user.createdAt}`);
      console.log(`   - Updated: ${user.updatedAt}`);
      
      if (user.employees) {
        console.log(`   - Employee Record: ✅ (ID: ${user.employees.id})`);
        console.log(`     - Function: ${user.employees.function}`);
        console.log(`     - Department: ${user.employees.department}`);
        console.log(`     - Is Active: ${user.employees.isActive}`);
      } else {
        console.log(`   - Employee Record: ❌`);
      }
      
      if (user.customers) {
        console.log(`   - Customer Record: ✅ (ID: ${user.customers.id})`);
      } else {
        console.log(`   - Customer Record: ❌`);
      }
      
      if (user.admins) {
        console.log(`   - Admin Record: ✅ (ID: ${user.admins.id})`);
      } else {
        console.log(`   - Admin Record: ❌`);
      }
      
      console.log('');
    });

    // Check for potential issues
    console.log('🔍 Potential Issues:\n');
    
    const usersWithoutClerkId = users.filter(u => !u.clerkId);
    if (usersWithoutClerkId.length > 0) {
      console.log(`❌ Users without Clerk ID: ${usersWithoutClerkId.length}`);
      usersWithoutClerkId.forEach(u => console.log(`   - ${u.email}`));
    } else {
      console.log('✅ All users have Clerk ID');
    }
    
    const usersWithoutUserType = users.filter(u => !u.userType);
    if (usersWithoutUserType.length > 0) {
      console.log(`❌ Users without User Type: ${usersWithoutUserType.length}`);
      usersWithoutUserType.forEach(u => console.log(`   - ${u.email}`));
    } else {
      console.log('✅ All users have User Type');
    }
    
    const internalUsersWithoutEmployee = users.filter(u => 
      (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && !u.employees
    );
    if (internalUsersWithoutEmployee.length > 0) {
      console.log(`❌ Internal users without employee record: ${internalUsersWithoutEmployee.length}`);
      internalUsersWithoutEmployee.forEach(u => console.log(`   - ${u.email} (${u.userType})`));
    } else {
      console.log('✅ All internal users have employee records');
    }
    
    const externalUsersWithEmployee = users.filter(u => 
      u.userType === 'CUSTOMER' && u.employees
    );
    if (externalUsersWithEmployee.length > 0) {
      console.log(`⚠️  External users with employee record: ${externalUsersWithEmployee.length}`);
      externalUsersWithEmployee.forEach(u => console.log(`   - ${u.email}`));
    } else {
      console.log('✅ No external users have employee records');
    }

    // Check recent activity
    console.log('\n📈 Recent Activity:');
    const recentUsers = users.slice(0, 5);
    recentUsers.forEach(user => {
      console.log(`   - ${user.email}: ${user.userType} (${user.createdAt.toISOString()})`);
    });

  } catch (error) {
    console.error('❌ Error debugging login flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLoginFlow();

