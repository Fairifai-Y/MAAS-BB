const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserTypes() {
  try {
    console.log('🧪 Testing user types implementation...\n');

    // Test 1: Check user type distribution
    console.log('📊 User Type Distribution:');
    const userTypeCounts = await prisma.user.groupBy({
      by: ['userType'],
      _count: { userType: true }
    });

    userTypeCounts.forEach(count => {
      console.log(`   - ${count.userType || 'NULL'}: ${count._count.userType} users`);
    });

    // Test 2: Check employee records
    console.log('\n👥 Employee Records:');
    const activeEmployees = await prisma.employees.count({
      where: { isActive: true }
    });
    const inactiveEmployees = await prisma.employees.count({
      where: { isActive: false }
    });
    console.log(`   - Active employees: ${activeEmployees}`);
    console.log(`   - Inactive employees: ${inactiveEmployees}`);

    // Test 3: Check specific users
    console.log('\n🔍 Specific User Analysis:');
    
    // Check Yuri (should be ADMIN)
    const yuri = await prisma.user.findUnique({
      where: { email: 'yuri@fitchannel.com' },
      include: { employees: true }
    });
    
    if (yuri) {
      console.log(`   - Yuri: ${yuri.userType} (${yuri.role}) - Employee: ${yuri.employees ? 'Yes' : 'No'}`);
    }

    // Check a customer
    const customer = await prisma.user.findFirst({
      where: { userType: 'CUSTOMER' },
      include: { employees: true }
    });
    
    if (customer) {
      console.log(`   - Customer: ${customer.email} - Employee: ${customer.employees ? 'Yes' : 'No'} (Active: ${customer.employees?.isActive || 'N/A'})`);
    }

    // Test 4: Check internal vs external
    console.log('\n🏢 Internal vs External:');
    const internalUsers = await prisma.user.count({
      where: { isInternal: true }
    });
    const externalUsers = await prisma.user.count({
      where: { isInternal: false }
    });
    console.log(`   - Internal users: ${internalUsers}`);
    console.log(`   - External users: ${externalUsers}`);

    // Test 5: Check for inconsistencies
    console.log('\n🔍 Checking for inconsistencies:');
    
    // Users with userType but no employee record (should only be CUSTOMER)
    const usersWithoutEmployee = await prisma.user.findMany({
      where: {
        userType: { in: ['EMPLOYEE', 'ADMIN'] },
        employees: null
      }
    });
    
    if (usersWithoutEmployee.length > 0) {
      console.log(`   ⚠️  ${usersWithoutEmployee.length} internal users without employee records:`);
      usersWithoutEmployee.forEach(user => {
        console.log(`      - ${user.email} (${user.userType})`);
      });
    } else {
      console.log(`   ✅ All internal users have employee records`);
    }

    // Customers with active employee records
    const customersWithActiveEmployees = await prisma.user.findMany({
      where: {
        userType: 'CUSTOMER',
        employees: {
          isActive: true
        }
      },
      include: { employees: true }
    });
    
    if (customersWithActiveEmployees.length > 0) {
      console.log(`   ⚠️  ${customersWithActiveEmployees.length} customers with active employee records:`);
      customersWithActiveEmployees.forEach(user => {
        console.log(`      - ${user.email}`);
      });
    } else {
      console.log(`   ✅ No customers have active employee records`);
    }

    console.log('\n🎉 User types test completed!');

  } catch (error) {
    console.error('❌ Error testing user types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserTypes();
