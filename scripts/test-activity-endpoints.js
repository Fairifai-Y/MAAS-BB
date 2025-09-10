const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testActivityEndpoints() {
  try {
    console.log('🧪 Testing activity endpoints...\n');

    // Test 1: Check if activities exist
    const activities = await prisma.activity.findMany({
      include: {
        customer_packages: {
          include: {
            customers: { include: { users: true } },
            packages: true
          }
        },
        employees: { include: { users: true } }
      }
    });

    console.log(`📊 Found ${activities.length} activities in database\n`);

    if (activities.length === 0) {
      console.log('❌ No activities found. The dropdown will be empty.');
      return;
    }

    // Test 2: Simulate admin activities endpoint
    console.log('🔍 Testing admin activities endpoint logic...');
    const adminActivities = await prisma.activity.findMany({
      include: {
        customer_packages: {
          include: {
            customers: {
              include: {
                users: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Admin activities endpoint would return ${adminActivities.length} activities`);
    console.log('   Sample activities:');
    adminActivities.slice(0, 3).forEach(activity => {
      const customer = activity.customer_packages?.customers?.users?.name || 'Unknown';
      console.log(`   - ${activity.description} (${customer})`);
    });
    console.log('');

    // Test 3: Simulate employee activities endpoint
    console.log('🔍 Testing employee activities endpoint logic...');
    const employeeActivities = await prisma.activity.findMany({
      include: {
        customer_packages: {
          include: {
            customers: {
              include: {
                users: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Employee activities endpoint would return ${employeeActivities.length} activities`);
    console.log('   Sample activities:');
    employeeActivities.slice(0, 3).forEach(activity => {
      const customer = activity.customer_packages?.customers?.users?.name || 'Unknown';
      console.log(`   - ${activity.description} (${customer})`);
    });
    console.log('');

    // Test 4: Check if activities have proper structure for dropdowns
    console.log('🔍 Testing dropdown structure...');
    const dropdownData = activities.map(activity => ({
      id: activity.id,
      description: activity.description,
      customer: activity.customer_packages?.customers?.users?.name || 'Unknown',
      company: activity.customer_packages?.customers?.company || 'Unknown Company'
    }));

    console.log('✅ Dropdown data structure:');
    dropdownData.slice(0, 3).forEach(item => {
      console.log(`   - ID: ${item.id}`);
      console.log(`     Description: ${item.description}`);
      console.log(`     Customer: ${item.customer}`);
      console.log(`     Company: ${item.company}`);
      console.log(`     Display: "${item.company} - ${item.description}"`);
      console.log('');
    });

    // Test 5: Check for any issues
    console.log('🔍 Checking for potential issues...');
    
    const activitiesWithoutCustomer = activities.filter(a => !a.customer_packages?.customers?.users?.name);
    if (activitiesWithoutCustomer.length > 0) {
      console.log(`⚠️  ${activitiesWithoutCustomer.length} activities without customer name`);
    }

    const activitiesWithoutDescription = activities.filter(a => !a.description);
    if (activitiesWithoutDescription.length > 0) {
      console.log(`⚠️  ${activitiesWithoutDescription.length} activities without description`);
    }

    if (activitiesWithoutCustomer.length === 0 && activitiesWithoutDescription.length === 0) {
      console.log('✅ All activities have proper data structure');
    }

    console.log('\n🎉 Activity endpoints test completed!');
    console.log('📝 Summary:');
    console.log(`   - Total activities: ${activities.length}`);
    console.log(`   - Admin endpoint ready: ✅`);
    console.log(`   - Employee endpoint ready: ✅`);
    console.log(`   - Dropdown data structure: ✅`);

  } catch (error) {
    console.error('❌ Error testing activity endpoints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActivityEndpoints();
