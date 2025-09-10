const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixRemainingCustomers() {
  try {
    console.log('🔧 Fixing remaining customers with active employee records...\n');

    // Find customers with active employee records
    const customersWithActiveEmployees = await prisma.user.findMany({
      where: {
        userType: 'CUSTOMER',
        employees: {
          isActive: true
        }
      },
      include: { employees: true }
    });

    console.log(`Found ${customersWithActiveEmployees.length} customers with active employee records:`);

    for (const customer of customersWithActiveEmployees) {
      console.log(`\n👤 Processing: ${customer.email}`);
      
      // Check if they should be internal (fitchannel.com email)
      if (customer.email.includes('@fitchannel.com')) {
        console.log(`   📧 Fitchannel email detected - marking as EMPLOYEE`);
        
        // Update user type to EMPLOYEE
        await prisma.user.update({
          where: { id: customer.id },
          data: {
            userType: 'EMPLOYEE',
            isInternal: true
          }
        });
        
        // Keep employee record active
        console.log(`   ✅ Updated to EMPLOYEE with active employee record`);
      } else {
        console.log(`   🏢 External customer - marking employee record as inactive`);
        
        // Mark employee record as inactive
        await prisma.employees.update({
          where: { id: customer.id },
          data: {
            isActive: false,
            function: 'Customer (Inactive)',
            department: 'External'
          }
        });
        
        console.log(`   ✅ Marked employee record as inactive`);
      }
    }

    // Final check
    console.log('\n📊 Final status:');
    const finalUserTypeCounts = await prisma.user.groupBy({
      by: ['userType'],
      _count: { userType: true }
    });

    finalUserTypeCounts.forEach(count => {
      console.log(`   - ${count.userType}: ${count._count.userType} users`);
    });

    const activeEmployees = await prisma.employees.count({
      where: { isActive: true }
    });
    const inactiveEmployees = await prisma.employees.count({
      where: { isActive: false }
    });
    console.log(`   - Active employees: ${activeEmployees}`);
    console.log(`   - Inactive employees: ${inactiveEmployees}`);

    console.log('\n🎉 Fix completed!');

  } catch (error) {
    console.error('❌ Error fixing customers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRemainingCustomers();
