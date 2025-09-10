const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyRealActivities() {
  try {
    console.log('🔍 Verifying real activities...\n');

    // Get all activities with their relationships
    const activities = await prisma.activity.findMany({
      include: {
        customer_packages: {
          include: {
            customers: { include: { users: true } },
            packages: {
              include: {
                packageActivities: {
                  include: {
                    activityTemplate: true
                  }
                }
              }
            }
          }
        },
        employees: { include: { users: true } }
      },
      orderBy: [
        { customer_packages: { customers: { users: { name: 'asc' } } } },
        { description: 'asc' }
      ]
    });

    console.log(`📊 Total activities: ${activities.length}\n`);

    // Group by customer
    const activitiesByCustomer = {};
    activities.forEach(activity => {
      const customerName = activity.customer_packages.customers.users.name;
      if (!activitiesByCustomer[customerName]) {
        activitiesByCustomer[customerName] = [];
      }
      activitiesByCustomer[customerName].push(activity);
    });

    console.log('🏢 Activities by customer:\n');

    Object.entries(activitiesByCustomer).forEach(([customerName, customerActivities]) => {
      console.log(`📋 ${customerName} (${customerActivities.length} activities):`);
      
      customerActivities.forEach(activity => {
        console.log(`   - ${activity.description} (${activity.hours}h) - ${activity.status}`);
      });
      console.log('');
    });

    // Check for customers with no activities
    const allCustomerPackages = await prisma.customer_packages.findMany({
      include: {
        customers: { include: { users: true } },
        packages: {
          include: {
            packageActivities: {
              include: {
                activityTemplate: true
              }
            }
          }
        }
      }
    });

    const customersWithNoActivities = allCustomerPackages.filter(cp => 
      !activities.find(a => a.customerPackageId === cp.id)
    );

    if (customersWithNoActivities.length > 0) {
      console.log('⚠️  Customers with no activities:');
      customersWithNoActivities.forEach(cp => {
        const packageActivities = cp.packages.packageActivities.length;
        console.log(`   - ${cp.customers.users.name}: ${packageActivities} package activities`);
      });
      console.log('');
    }

    // Category breakdown
    console.log('📊 Category breakdown:');
    const categoryCount = {};
    activities.forEach(activity => {
      // Find the template for this activity
      const packageActivity = activity.customer_packages.packages.packageActivities.find(pa => 
        pa.activityTemplate.name === activity.description
      );
      
      if (packageActivity) {
        const category = packageActivity.activityTemplate.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} activities`);
    });

    // Employee breakdown
    console.log('\n👥 Employee breakdown:');
    const employeeCount = {};
    activities.forEach(activity => {
      const employeeName = activity.employees.users.name;
      employeeCount[employeeName] = (employeeCount[employeeName] || 0) + 1;
    });

    Object.entries(employeeCount).forEach(([employee, count]) => {
      console.log(`   - ${employee}: ${count} activities`);
    });

    // Status breakdown
    console.log('\n📈 Status breakdown:');
    const statusCount = {};
    activities.forEach(activity => {
      statusCount[activity.status] = (statusCount[activity.status] || 0) + 1;
    });

    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} activities`);
    });

    console.log('\n🎉 Verification completed!');

  } catch (error) {
    console.error('❌ Error verifying real activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRealActivities();
