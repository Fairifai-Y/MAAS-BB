const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        clerkId: `admin_${Date.now()}`,
        email: 'admin@fitchannel.com',
        name: 'Admin User',
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🆔 ID:', admin.id);
    console.log('🔑 Clerk ID:', admin.clerkId);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('1. Update the clerkId in the database with the actual Clerk user ID');
    console.log('2. Or create a new user in Clerk with this email and update the clerkId');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
