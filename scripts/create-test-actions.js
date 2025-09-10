const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestActions() {
  try {
    console.log('🎯 Creating test actions for dashboard...\n');

    // Get some activities to create actions for
    const activities = await prisma.activity.findMany({
      include: {
        employees: {
          include: {
            users: true
          }
        },
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
      take: 10 // Take first 10 activities
    });

    console.log(`📋 Found ${activities.length} activities to create actions for\n`);

    let actionsCreated = 0;

    for (const activity of activities) {
      // Create 1-3 actions per activity
      const numActions = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numActions; i++) {
        const statuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const plannedHours = Math.random() * activity.hours + 0.5; // Random hours up to activity hours
        
        const action = await prisma.action.create({
          data: {
            activityId: activity.id,
            ownerId: activity.employeeId,
            title: `${activity.description} - Actie ${i + 1}`,
            description: `Uitvoering van ${activity.description} voor ${activity.customer_packages.customers.users.name}`,
            plannedHours: plannedHours,
            actualHours: randomStatus === 'COMPLETED' ? plannedHours : null,
            status: randomStatus,
            dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
            completedAt: randomStatus === 'COMPLETED' ? new Date() : null
          }
        });

        console.log(`✅ Created action: ${action.title}`);
        console.log(`   - Status: ${action.status}`);
        console.log(`   - Planned Hours: ${action.plannedHours}`);
        console.log(`   - Customer: ${activity.customer_packages.customers.users.name}`);
        console.log(`   - Employee: ${activity.employees.users.name}`);
        console.log('');

        actionsCreated++;
      }
    }

    console.log(`🎉 Created ${actionsCreated} test actions!`);

    // Show summary
    const actionSummary = await prisma.action.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('\n📊 Action Summary:');
    actionSummary.forEach(summary => {
      console.log(`   - ${summary.status}: ${summary._count.status} actions`);
    });

  } catch (error) {
    console.error('❌ Error creating test actions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestActions();
