const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        clerkId: true
      }
    });

    console.log(`\n📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.clerkId}): role=${user.role}`);
    });

    const adminUsers = users.filter(user => user.role === 'ADMIN');
    console.log(`\n👑 Admin users: ${adminUsers.length}`);
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.clerkId})`);
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
