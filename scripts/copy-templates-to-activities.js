const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function copyTemplatesToActivities() {
  try {
    console.log('🔄 Copying activity templates to activities...\n');

    // Get Yuri's employee record
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

    // Get all activity templates
    const templates = await prisma.activityTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    console.log(`📋 Found ${templates.length} active templates to copy\n`);

    // Get a customer package to link activities to
    const customerPackage = await prisma.customer_packages.findFirst({
      include: {
        customers: { include: { users: true } },
        packages: true
      }
    });

    if (!customerPackage) {
      console.log('❌ No customer packages found');
      return;
    }

    console.log(`📦 Using customer package: ${customerPackage.customers.users.name} - ${customerPackage.packages.name}`);
    console.log(`   Package ID: ${customerPackage.id}\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const template of templates) {
      try {
        // Check if activity already exists for this template
        const existingActivity = await prisma.activity.findFirst({
          where: {
            description: template.name,
            customerPackageId: customerPackage.id,
            employeeId: yuri.employees.id
          }
        });

        if (existingActivity) {
          console.log(`⚠️  Activity already exists: ${template.name}`);
          skippedCount++;
          continue;
        }

        // Create activity from template
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

        console.log(`✅ Created activity: ${template.name}`);
        console.log(`   - Hours: ${template.estimatedHours}h`);
        console.log(`   - Category: ${template.category}`);
        console.log(`   - Status: PENDING`);
        console.log(`   - Activity ID: ${activity.id}\n`);

        createdCount++;

      } catch (error) {
        console.log(`❌ Error creating activity for ${template.name}: ${error.message}`);
      }
    }

    console.log(`🎉 Copy completed!`);
    console.log(`   - Created: ${createdCount} activities`);
    console.log(`   - Skipped: ${skippedCount} activities (already exist)`);

    // Final count
    const totalActivities = await prisma.activity.count();
    console.log(`   - Total activities in database: ${totalActivities}`);

  } catch (error) {
    console.error('❌ Error copying templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

copyTemplatesToActivities();
