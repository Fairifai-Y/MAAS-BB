const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDuplicatePackages() {
  try {
    console.log('🔍 Checking for duplicate packages and activities...\n');

    // Find customer "Montfoort Vitaal"
    const customer = await prisma.customers.findFirst({
      where: {
        company: {
          contains: 'Montfoort',
          mode: 'insensitive'
        }
      },
      include: {
        users: true,
        customer_packages: {
          include: {
            packages: true
          }
        }
      }
    });

    if (!customer) {
      console.log('❌ Customer "Montfoort Vitaal" not found');
      return;
    }

    console.log(`✅ Found customer: ${customer.company} (ID: ${customer.id})`);
    console.log(`📧 Email: ${customer.users.email}`);
    console.log(`📦 Number of packages: ${customer.customer_packages.length}\n`);

    // Check for duplicate packages
    const packageGroups = {};
    customer.customer_packages.forEach(cp => {
      const packageName = cp.packages.name;
      if (!packageGroups[packageName]) {
        packageGroups[packageName] = [];
      }
      packageGroups[packageName].push(cp);
    });

    console.log('📦 Package Analysis:');
    Object.entries(packageGroups).forEach(([packageName, packages]) => {
      console.log(`\n  Package: ${packageName}`);
      console.log(`  Count: ${packages.length}`);
      
      if (packages.length > 1) {
        console.log(`  ⚠️  DUPLICATE DETECTED!`);
        packages.forEach((pkg, index) => {
          console.log(`    ${index + 1}. ID: ${pkg.id}, Status: ${pkg.status}, Start: ${pkg.startDate}`);
        });
      } else {
        console.log(`  ✅ No duplicates`);
      }
    });

    // Check package activities for each package
    console.log('\n🔧 Package Activities Analysis:');
    for (const cp of customer.customer_packages) {
      console.log(`\n  Package: ${cp.packages.name} (ID: ${cp.packages.id})`);
      
      const packageActivities = await prisma.packageActivity.findMany({
        where: {
          packageId: cp.packages.id
        },
        include: {
          activityTemplate: true
        }
      });

      console.log(`  Activities count: ${packageActivities.length}`);
      
      if (packageActivities.length > 0) {
        const activityGroups = {};
        packageActivities.forEach(pa => {
          const activityName = pa.activityTemplate.name;
          if (!activityGroups[activityName]) {
            activityGroups[activityName] = [];
          }
          activityGroups[activityName].push(pa);
        });

        Object.entries(activityGroups).forEach(([activityName, activities]) => {
          console.log(`    ${activityName}: ${activities.length} entries`);
          if (activities.length > 1) {
            console.log(`    ⚠️  DUPLICATE ACTIVITY DETECTED!`);
            activities.forEach((act, index) => {
              console.log(`      ${index + 1}. ID: ${act.id}, Quantity: ${act.quantity}`);
            });
          }
        });
      }
    }

    // Check for duplicate package activities across all packages
    console.log('\n🔍 Cross-Package Activity Analysis:');
    const allPackageActivities = await prisma.packageActivity.findMany({
      where: {
        package: {
          customer_packages: {
            some: {
              customerId: customer.id
            }
          }
        }
      },
      include: {
        activityTemplate: true,
        package: true
      }
    });

    const crossPackageGroups = {};
    allPackageActivities.forEach(pa => {
      const key = `${pa.activityTemplate.name}-${pa.package.name}`;
      if (!crossPackageGroups[key]) {
        crossPackageGroups[key] = [];
      }
      crossPackageGroups[key].push(pa);
    });

    Object.entries(crossPackageGroups).forEach(([key, activities]) => {
      if (activities.length > 1) {
        console.log(`\n  ⚠️  DUPLICATE: ${key}`);
        console.log(`  Count: ${activities.length}`);
        activities.forEach((act, index) => {
          console.log(`    ${index + 1}. Package: ${act.package.name}, Quantity: ${act.quantity}, ID: ${act.id}`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicatePackages();
