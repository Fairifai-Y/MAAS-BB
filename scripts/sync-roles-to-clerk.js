const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncRolesToClerk() {
  try {
    console.log('🔄 Syncing user roles from database to Clerk...');
    
    // Get all users with their roles
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        clerkId: true,
        role: true
      }
    });

    // Filter for users with clerkId
    const users = allUsers.filter(user => user.clerkId && user.clerkId !== null);

    console.log(`📊 Found ${users.length} users with Clerk IDs`);

    for (const user of users) {
      try {
        console.log(`\n👤 Syncing ${user.email} (${user.clerkId}) -> role: ${user.role}`);
        
        // Update Clerk user with role in publicMetadata
        const response = await fetch(`https://api.clerk.com/v1/users/${user.clerkId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            public_metadata: {
              role: user.role
            }
          })
        });

        if (response.ok) {
          console.log(`✅ Successfully synced role for ${user.email}`);
        } else {
          const errorData = await response.json();
          console.log(`❌ Failed to sync role for ${user.email}:`, errorData);
        }
      } catch (error) {
        console.log(`❌ Error syncing ${user.email}:`, error.message);
      }
    }

    console.log('\n🎉 Role sync completed!');
    
  } catch (error) {
    console.error('❌ Error syncing roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncRolesToClerk();