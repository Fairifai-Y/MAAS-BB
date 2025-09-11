const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSyncUser() {
  try {
    console.log('🔍 Testing sync-user API logic...\n');

    // Simulate the sync-user API logic
    const testUserId = 'user_32UyWw8aKm9AWyXlsOIJvURsNHB'; // Yuri's Clerk ID
    const testEmail = 'yuri@fitchannel.com';

    console.log(`Testing with Clerk ID: ${testUserId}`);
    console.log(`Testing with Email: ${testEmail}\n`);

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        employees: true,
        customers: true,
        admins: true
      }
    });

    if (existingUser) {
      console.log('✅ User found in database:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Name: ${existingUser.name}`);
      console.log(`   - Clerk ID: ${existingUser.clerkId}`);
      console.log(`   - Role: ${existingUser.role}`);
      console.log(`   - User Type: ${existingUser.userType}`);
      console.log(`   - Is Internal: ${existingUser.isInternal}`);

      // Check if clerkId matches
      if (existingUser.clerkId !== testUserId) {
        console.log(`⚠️  Clerk ID mismatch! DB: ${existingUser.clerkId}, Test: ${testUserId}`);
      } else {
        console.log('✅ Clerk ID matches');
      }

      // Check userType
      if (!existingUser.userType) {
        console.log('❌ User Type is missing');
      } else {
        console.log('✅ User Type is set');
      }

      // Check employee record for internal users
      if (existingUser.userType === 'EMPLOYEE' || existingUser.userType === 'ADMIN') {
        if (existingUser.employees) {
          console.log('✅ Employee record exists');
        } else {
          console.log('❌ Employee record missing for internal user');
        }
      }

      // Simulate the response
      const response = {
        message: 'User synced successfully',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          userType: existingUser.userType,
          clerkId: testUserId
        }
      };

      console.log('\n📤 Simulated API Response:');
      console.log(JSON.stringify(response, null, 2));

      // Test redirect logic
      console.log('\n🔄 Redirect Logic Test:');
      const userType = response.user.userType || response.user.role;
      console.log(`   - User Type: ${userType}`);
      
      if (userType === 'ADMIN') {
        console.log('   - Would redirect to: /admin');
      } else if (userType === 'EMPLOYEE') {
        console.log('   - Would redirect to: /dashboard');
      } else {
        console.log('   - Would redirect to: /dashboard (CUSTOMER)');
      }

    } else {
      console.log('❌ User not found in database');
    }

  } catch (error) {
    console.error('❌ Error testing sync-user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSyncUser();

