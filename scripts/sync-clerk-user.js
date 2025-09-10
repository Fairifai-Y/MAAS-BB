const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function syncClerkUser() {
  try {
    console.log('🔧 Syncing Clerk user with database...');
    
    // Find the user we just created
    const user = await prisma.user.findUnique({
      where: { email: 'yuri@fitchannel.com' }
    });

    if (user) {
      console.log('✅ User found in database:');
      console.log('📧 Email:', user.email);
      console.log('🆔 ID:', user.id);
      console.log('🔑 Current Clerk ID:', user.clerkId);
      console.log('👑 Role:', user.role);
      console.log('');
      console.log('💡 Next steps:');
      console.log('1. Go to https://www.fitchannel.app/auth');
      console.log('2. Sign in with yuri@fitchannel.com');
      console.log('3. The Clerk ID will be automatically updated');
      console.log('4. You will be redirected to /admin as an admin user');
    } else {
      console.log('❌ User not found in database');
    }
    
  } catch (error) {
    console.error('❌ Error syncing user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncClerkUser();
