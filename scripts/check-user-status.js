const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserStatus() {
  try {
    console.log('🔍 Checking user status...\n');

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        employees: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Clerk ID: ${user.clerkId}`);
      console.log(`   - Employee Record: ${user.employees ? 'Yes' : 'No'}`);
      if (user.employees) {
        console.log(`   - Employee ID: ${user.employees.id}`);
        console.log(`   - Active: ${user.employees.isActive}`);
        console.log(`   - Hourly Rate: €${user.employees.hourlyRate}`);
      }
      console.log('');
    });

    // Check for users without employee records
    const usersWithoutEmployee = users.filter(user => !user.employees);
    if (usersWithoutEmployee.length > 0) {
      console.log('⚠️  Users without employee records:');
      usersWithoutEmployee.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      console.log('');
    }

    // Check for employees without user records
    const employees = await prisma.employees.findMany({
      include: {
        users: true
      }
    });

    console.log(`👥 Found ${employees.length} employee records:\n`);

    employees.forEach((employee, index) => {
      console.log(`${index + 1}. Employee ID: ${employee.id}`);
      console.log(`   - User: ${employee.users ? employee.users.name : 'No user record'}`);
      console.log(`   - Email: ${employee.users ? employee.users.email : 'N/A'}`);
      console.log(`   - Active: ${employee.isActive}`);
      console.log(`   - Hourly Rate: €${employee.hourlyRate}`);
      console.log('');
    });

    // Check activities
    const activities = await prisma.activity.findMany({
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
      }
    });

    console.log(`📋 Found ${activities.length} activities:\n`);

    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.description}`);
      console.log(`   - Customer: ${activity.customer_packages?.customers?.users?.name || 'No customer'}`);
      console.log(`   - Company: ${activity.customer_packages?.customers?.company || 'No company'}`);
      console.log(`   - Employee ID: ${activity.employeeId || 'Not assigned'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking user status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
