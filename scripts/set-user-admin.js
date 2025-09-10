const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setUserAsAdmin() {
  try {
    console.log('🔧 Setting yuri@fitchannel.com as admin...');
    
    // First, check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'yuri@fitchannel.com' }
    });

    if (existingUser) {
      console.log('✅ User found:', existingUser.email);
      console.log('Current role:', existingUser.role);
      
      // Update role to ADMIN
      const updatedUser = await prisma.user.update({
        where: { email: 'yuri@fitchannel.com' },
        data: { role: 'ADMIN' }
      });
      
      console.log('✅ User role updated to ADMIN!');
      console.log('📧 Email:', updatedUser.email);
      console.log('🆔 ID:', updatedUser.id);
      console.log('🔑 Clerk ID:', updatedUser.clerkId);
      console.log('👑 Role:', updatedUser.role);
    } else {
      console.log('❌ User yuri@fitchannel.com not found in database');
      console.log('💡 You need to sign up first through the application to create the user record');
      console.log('💡 Then run this script again to set the role to ADMIN');
    }
    
  } catch (error) {
    console.error('❌ Error setting user as admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUserAsAdmin();
