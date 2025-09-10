const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupAndCreateRealActivities() {
  try {
    console.log('🧹 Cleaning up wrong activities and creating real ones...\n');

    // Step 1: Get Yuri's employee record
    const yuri = await prisma.user.findUnique({
      where: { email: 'yuri@fitchannel.com' },
      include: { employees: true }
    });

    if (!yuri || !yuri.employees) {
      console.log('❌ Yuri not found or no employee record');
      return;
    }

    console.log(`👤 Using Yuri as employee: ${yuri.name} (${yuri.email})`);
    console.log(`   Employee ID: ${yuri.employees.id}\n`);

    // Step 2: Delete all existing activities
    console.log('🗑️  Deleting all existing activities...');
    const deleteResult = await prisma.activity.deleteMany({});
    console.log(`   Deleted ${deleteResult.count} activities\n`);

    // Step 3: Get all customer packages with their package activities
    const customerPackages = await prisma.customer_packages.findMany({
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

    console.log(`📦 Found ${customerPackages.length} customer packages\n`);

    let totalActivitiesCreated = 0;

    // Step 4: Create activities for each customer package
    for (const customerPackage of customerPackages) {
      const customer = customerPackage.customers.users.name;
      const packageName = customerPackage.packages.name;
      
      console.log(`🏢 Processing: ${customer} - ${packageName}`);
      console.log(`   Package ID: ${customerPackage.id}`);

      let packageActivitiesCreated = 0;

      for (const packageActivity of customerPackage.packages.packageActivities) {
        const template = packageActivity.activityTemplate;
        const quantity = packageActivity.quantity;

        // Create activities based on quantity
        for (let i = 0; i < quantity; i++) {
          try {
            const activity = await prisma.activity.create({
              data: {
                customerPackageId: customerPackage.id,
                employeeId: yuri.employees.id,
                description: template.name,
                hours: template.estimatedHours,
                date: new Date(),
                status: 'PENDING'
              }
            });

            console.log(`   ✅ Created: ${template.name} (${template.estimatedHours}h) - ${template.category}`);
            packageActivitiesCreated++;
            totalActivitiesCreated++;

          } catch (error) {
            console.log(`   ❌ Error creating activity: ${error.message}`);
          }
        }
      }

      console.log(`   📊 Created ${packageActivitiesCreated} activities for ${customer}\n`);
    }

    // Step 5: Final summary
    console.log(`🎉 Real activities creation completed!`);
    console.log(`   - Total activities created: ${totalActivitiesCreated}`);
    console.log(`   - Customer packages processed: ${customerPackages.length}`);

    // Step 6: Verify results
    const finalActivityCount = await prisma.activity.count();
    console.log(`   - Final activity count in database: ${finalActivityCount}`);

    // Show some examples
    const sampleActivities = await prisma.activity.findMany({
      include: {
        customer_packages: {
          include: {
            customers: { include: { users: true } },
            packages: true
          }
        },
        employees: { include: { users: true } }
      },
      take: 5
    });

    console.log(`\n📋 Sample activities:`);
    sampleActivities.forEach((activity, index) => {
      console.log(`   ${index + 1}. ${activity.description}`);
      console.log(`      - Customer: ${activity.customer_packages.customers.users.name}`);
      console.log(`      - Package: ${activity.customer_packages.packages.name}`);
      console.log(`      - Hours: ${activity.hours}h`);
      console.log(`      - Status: ${activity.status}`);
      console.log(`      - Employee: ${activity.employees.users.name}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error cleaning up and creating real activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAndCreateRealActivities();
