const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicatePackages() {
  try {
    console.log('🧹 Starting cleanup of duplicate packages...\n');

    // Find customer "Montfoort Vitaal"
    const customer = await prisma.customers.findFirst({
      where: {
        company: {
          contains: 'Montfoort',
          mode: 'insensitive'
        }
      },
      include: {
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

    // Group packages by name
    const packageGroups = {};
    customer.customer_packages.forEach(cp => {
      const packageName = cp.packages.name;
      if (!packageGroups[packageName]) {
        packageGroups[packageName] = [];
      }
      packageGroups[packageName].push(cp);
    });

    // Process each package group
    for (const [packageName, packages] of Object.entries(packageGroups)) {
      console.log(`\n📦 Processing package: ${packageName}`);
      console.log(`   Found ${packages.length} instances`);

      if (packages.length > 1) {
        // Keep the first one, remove the rest
        const [keepPackage, ...removePackages] = packages;
        
        console.log(`   ✅ Keeping: ${keepPackage.id} (created: ${keepPackage.createdAt})`);
        
        for (const removePackage of removePackages) {
          console.log(`   🗑️  Removing: ${removePackage.id} (created: ${removePackage.createdAt})`);
          
          // First, remove all package activities for this package
          const packageActivities = await prisma.packageActivity.findMany({
            where: {
              packageId: removePackage.packageId
            }
          });
          
          console.log(`      Removing ${packageActivities.length} package activities`);
          for (const pa of packageActivities) {
            await prisma.packageActivity.delete({
              where: { id: pa.id }
            });
          }
          
          // Then remove the customer package relationship
          await prisma.customer_packages.delete({
            where: { id: removePackage.id }
          });
          
          // Finally, remove the package itself if no other customers use it
          const otherCustomerPackages = await prisma.customer_packages.findMany({
            where: {
              packageId: removePackage.packageId
            }
          });
          
          if (otherCustomerPackages.length === 0) {
            console.log(`      Removing package: ${removePackage.packages.name}`);
            await prisma.package.delete({
              where: { id: removePackage.packageId }
            });
          } else {
            console.log(`      Keeping package (used by ${otherCustomerPackages.length} other customers)`);
          }
        }
      } else {
        console.log(`   ✅ No duplicates found`);
      }
    }

    console.log('\n✅ Cleanup completed successfully!');
    
    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const updatedCustomer = await prisma.customers.findFirst({
      where: { id: customer.id },
      include: {
        customer_packages: {
          include: {
            packages: true
          }
        }
      }
    });

    console.log(`📦 Remaining packages for ${updatedCustomer.company}: ${updatedCustomer.customer_packages.length}`);
    updatedCustomer.customer_packages.forEach(cp => {
      console.log(`   - ${cp.packages.name} (ID: ${cp.id})`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicatePackages();
