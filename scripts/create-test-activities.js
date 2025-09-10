const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestActivities() {
  try {
    console.log('🧪 Creating test activities...\n');

    // Get some customer packages and employees
    const customerPackages = await prisma.customer_packages.findMany({
      include: {
        customers: { include: { users: true } },
        packages: true
      },
      take: 5
    });

    const employees = await prisma.employees.findMany({
      include: { users: true },
      take: 3
    });

    console.log(`📦 Found ${customerPackages.length} customer packages`);
    console.log(`👥 Found ${employees.length} employees\n`);

    if (customerPackages.length === 0) {
      console.log('❌ No customer packages found. Please create some packages first.');
      return;
    }

    if (employees.length === 0) {
      console.log('❌ No employees found. Please create some employees first.');
      return;
    }

    // Create test activities
    const testActivities = [
      {
        description: "Website onderhoud en updates",
        hours: 4.5,
        date: new Date('2024-01-15'),
        status: 'PENDING'
      },
      {
        description: "SEO optimalisatie homepage",
        hours: 6.0,
        date: new Date('2024-01-16'),
        status: 'APPROVED'
      },
      {
        description: "Social media content creatie",
        hours: 3.0,
        date: new Date('2024-01-17'),
        status: 'COMPLETED'
      },
      {
        description: "Email marketing campagne setup",
        hours: 5.5,
        date: new Date('2024-01-18'),
        status: 'PENDING'
      },
      {
        description: "Database backup en monitoring",
        hours: 2.0,
        date: new Date('2024-01-19'),
        status: 'APPROVED'
      }
    ];

    console.log('🔨 Creating test activities...\n');

    for (let i = 0; i < testActivities.length; i++) {
      const activityData = testActivities[i];
      const customerPackage = customerPackages[i % customerPackages.length];
      const employee = employees[i % employees.length];

      try {
        const activity = await prisma.activity.create({
          data: {
            customerPackageId: customerPackage.id,
            employeeId: employee.id,
            description: activityData.description,
            hours: activityData.hours,
            date: activityData.date,
            status: activityData.status
          },
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

        console.log(`✅ Created activity: ${activity.description}`);
        console.log(`   - Customer: ${activity.customer_packages.customers.users.name}`);
        console.log(`   - Package: ${activity.customer_packages.packages.name}`);
        console.log(`   - Employee: ${activity.employees.users.name}`);
        console.log(`   - Hours: ${activity.hours}h`);
        console.log(`   - Status: ${activity.status}\n`);
      } catch (error) {
        console.error(`❌ Error creating activity ${i + 1}:`, error.message);
      }
    }

    // Check final count
    const finalCount = await prisma.activity.count();
    console.log(`🎉 Final result: ${finalCount} activities in database`);

  } catch (error) {
    console.error('❌ Error creating test activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestActivities();
