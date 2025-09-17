const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncActiveClerkUsers() {
  try {
    console.log('🔄 Getting active Clerk users and syncing roles...');
    
    // First, get all active Clerk users
    const clerkResponse = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!clerkResponse.ok) {
      throw new Error(`Failed to fetch Clerk users: ${clerkResponse.status}`);
    }

    const clerkData = await clerkResponse.json();
    console.log(`📊 Found ${clerkData.length} active Clerk users`);

    for (const clerkUser of clerkData) {
      try {
        const email = clerkUser.email_addresses[0]?.email_address;
        if (!email) continue;

        console.log(`\n👤 Processing ${email} (${clerkUser.id})`);

        // Find user in database
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { clerkId: clerkUser.id },
              { email: email }
            ]
          },
          select: {
            id: true,
            email: true,
            clerkId: true,
            role: true
          }
        });

        if (dbUser) {
          console.log(`✅ Found in database: role=${dbUser.role}`);
          
          // Update clerkId if different
          if (dbUser.clerkId !== clerkUser.id) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { clerkId: clerkUser.id }
            });
            console.log(`🔧 Updated clerkId in database`);
          }

          // Update Clerk with role from database
          const currentMetadata = clerkUser.public_metadata || {};
          if (currentMetadata.role !== dbUser.role) {
            const response = await fetch(`https://api.clerk.com/v1/users/${clerkUser.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                public_metadata: {
                  ...currentMetadata,
                  role: dbUser.role
                }
              })
            });

            if (response.ok) {
              console.log(`✅ Synced role to Clerk: ${dbUser.role}`);
            } else {
              const errorData = await response.json();
              console.log(`❌ Failed to sync role:`, errorData);
            }
          } else {
            console.log(`✅ Role already synced: ${dbUser.role}`);
          }
        } else {
          console.log(`⚠️  User not found in database`);
        }
      } catch (error) {
        console.log(`❌ Error processing user:`, error.message);
      }
    }

    console.log('\n🎉 Sync completed!');
    
  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncActiveClerkUsers();
