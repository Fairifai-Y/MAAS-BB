const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDashboardData() {
  try {
    console.log('🔍 Testing dashboard data for customers...\n');

    // Get all customers with their packages and activities
    const customers = await prisma.user.findMany({
      where: {
        customers: {
          isNot: null
        }
      },
      include: {
        customers: {
          include: {
            customer_packages: {
              include: {
                packages: {
                  include: {
                    packageActivities: {
                      include: {
                        activityTemplate: true
                      }
                    }
                  }
                },
                activities: {
                  include: {
                    employees: {
                      include: {
                        users: true
                      }
                    },
                    actions: {
                      include: {
                        owner: {
                          include: {
                            users: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`📊 Found ${customers.length} customers with packages\n`);

    customers.forEach((customer, index) => {
      console.log(`👤 Customer ${index + 1}: ${customer.name} (${customer.email})`);
      
      if (customer.customers) {
        const packages = customer.customers.customer_packages;
        console.log(`   📦 Packages: ${packages.length}`);
        
        packages.forEach((pkg, pkgIndex) => {
          console.log(`      ${pkgIndex + 1}. ${pkg.packages.name}`);
          console.log(`         - Price: €${pkg.packages.price}`);
          console.log(`         - Max Hours: ${pkg.packages.maxHours}`);
          console.log(`         - Status: ${pkg.status}`);
          console.log(`         - Activities: ${pkg.activities.length}`);
          console.log(`         - Actions: ${pkg.activities.reduce((sum, act) => sum + act.actions.length, 0)}`);
        });
        
        // Calculate totals
        const totalPackages = packages.length;
        const totalActivities = packages.reduce((sum, pkg) => sum + pkg.activities.length, 0);
        const totalActions = packages.reduce((sum, pkg) => 
          sum + pkg.activities.reduce((actSum, act) => actSum + act.actions.length, 0), 0);
        const totalHoursUsed = packages.reduce((sum, pkg) => 
          sum + pkg.activities.reduce((actSum, act) => actSum + act.hours, 0), 0);
        const totalMaxHours = packages.reduce((sum, pkg) => sum + pkg.packages.maxHours, 0);
        
        console.log(`   📈 Totals:`);
        console.log(`      - Packages: ${totalPackages}`);
        console.log(`      - Activities: ${totalActivities}`);
        console.log(`      - Actions: ${totalActions}`);
        console.log(`      - Hours Used: ${totalHoursUsed}`);
        console.log(`      - Max Hours: ${totalMaxHours}`);
        console.log(`      - Hours Remaining: ${totalMaxHours - totalHoursUsed}`);
      } else {
        console.log(`   ❌ No customer record found`);
      }
      
      console.log('');
    });

    // Test specific customer data structure
    if (customers.length > 0) {
      const firstCustomer = customers[0];
      console.log('🔍 Sample data structure for first customer:');
      console.log(JSON.stringify({
        id: firstCustomer.id,
        name: firstCustomer.name,
        email: firstCustomer.email,
        packages: firstCustomer.customers?.customer_packages.map(pkg => ({
          id: pkg.id,
          packageName: pkg.packages.name,
          price: pkg.packages.price,
          maxHours: pkg.packages.maxHours,
          status: pkg.status,
          activitiesCount: pkg.activities.length,
          actionsCount: pkg.activities.reduce((sum, act) => sum + act.actions.length, 0)
        }))
      }, null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing dashboard data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardData();
