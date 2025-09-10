const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserCount() {
  try {
    console.log('🔍 Checking user and employee counts...\n');

    const userCount = await prisma.user.count();
    const employeeCount = await prisma.employees.count();

    console.log(`📊 Current counts:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Employees: ${employeeCount}\n`);

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      include: {
        employees: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log('👥 Recent users:');
    recentUsers.forEach((user, index) => {
      const hasEmployee = user.employees ? '✅' : '❌';
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Employee: ${hasEmployee}`);
    });

    // Check for duplicates
    const duplicateEmails = await prisma.user.groupBy({
      by: ['email'],
      _count: {
        email: true
      },
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (duplicateEmails.length > 0) {
      console.log('\n⚠️  Duplicate emails found:');
      duplicateEmails.forEach(dup => {
        console.log(`   - ${dup.email}: ${dup._count.email} times`);
      });
    } else {
      console.log('\n✅ No duplicate emails found');
    }

  } catch (error) {
    console.error('❌ Error checking user count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserCount();
