const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createYuriAdmin() {
  try {
    console.log('🔧 Creating yuri@fitchannel.com as admin user...');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'yuri@fitchannel.com' }
    });

    if (existingUser) {
      console.log('✅ User already exists, updating role to ADMIN...');
      
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
      console.log('📝 Creating new admin user...');
      
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          clerkId: `yuri_${Date.now()}`, // Temporary ID, will be updated when you sign in
          email: 'yuri@fitchannel.com',
          name: 'Yuri',
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', newUser.email);
      console.log('🆔 ID:', newUser.id);
      console.log('🔑 Clerk ID:', newUser.clerkId);
      console.log('👑 Role:', newUser.role);
      console.log('');
      console.log('⚠️  IMPORTANT:');
      console.log('1. When you sign in with Clerk, the clerkId will be automatically updated');
      console.log('2. You now have admin access to the platform');
      console.log('3. You can access /admin routes and manage users');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createYuriAdmin();
