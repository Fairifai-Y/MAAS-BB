const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testClerkWebhook() {
  try {
    console.log('🔍 Testing Clerk webhook logic...\n');

    // Simulate a user.created webhook event
    const webhookEvent = {
      type: 'user.created',
      data: {
        id: 'user_webhook_test123',
        email_addresses: [
          {
            email_address: 'webhook@fitchannel.com'
          }
        ],
        first_name: 'Webhook',
        last_name: 'Test'
      }
    };

    console.log('📨 Simulating webhook event:', JSON.stringify(webhookEvent, null, 2));

    const email = webhookEvent.data.email_addresses[0]?.email_address;
    const userId = webhookEvent.data.id;
    const name = `${webhookEvent.data.first_name} ${webhookEvent.data.last_name}`;

    console.log(`\n📧 Email: ${email}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📝 Name: ${name}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('⚠️  User already exists, cleaning up...');
      await prisma.user.delete({
        where: { email }
      });
      console.log('✅ Cleaned up existing user');
    }

    // Simulate webhook logic
    console.log('\n🔄 Processing webhook...');

    // Determine user type
    function determineUserType(email) {
      if (email.includes('@fitchannel.com')) return 'EMPLOYEE';
      return 'CUSTOMER';
    }

    const userType = determineUserType(email);
    console.log(`🎯 Determined user type: ${userType}`);

    // Create user
    console.log('🆕 Creating user from webhook...');
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        role: 'CUSTOMER',
        userType,
        isInternal: userType !== 'CUSTOMER'
      }
    });

    console.log('✅ User created:', {
      id: newUser.id,
      email: newUser.email,
      userType: newUser.userType,
      isInternal: newUser.isInternal
    });

    // Create employee record for internal users
    if (userType === 'EMPLOYEE' || userType === 'ADMIN') {
      console.log('👤 Creating employee record...');
      const employee = await prisma.employees.create({
        data: {
          id: newUser.id,
          userId: newUser.id,
          hourlyRate: 0,
          contractHours: 40,
          isActive: true,
          function: userType === 'ADMIN' ? 'Admin' : 'Medewerker',
          department: userType === 'ADMIN' ? 'Management' : 'Operations',
          internalHourlyRate: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Employee record created:', employee.id);
    }

    console.log('\n🎉 Webhook processing completed successfully!');

    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await prisma.user.delete({
      where: { email }
    });
    console.log('✅ Test user cleaned up');

  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testClerkWebhook();



