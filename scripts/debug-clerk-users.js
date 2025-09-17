const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugClerkUsers() {
  try {
    console.log('🔍 Debugging Clerk API...');
    
    // First, get all active Clerk users
    const clerkResponse = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Clerk API Response Status:', clerkResponse.status);

    if (!clerkResponse.ok) {
      const errorText = await clerkResponse.text();
      console.log('❌ Clerk API Error:', errorText);
      return;
    }

    const clerkData = await clerkResponse.json();
    console.log('📋 Clerk API Response Structure:', JSON.stringify(clerkData, null, 2));

    if (clerkData.data) {
      console.log(`📊 Found ${clerkData.data.length} active Clerk users in data array`);
      
      clerkData.data.forEach((user, index) => {
        const email = user.email_addresses?.[0]?.email_address;
        console.log(`${index + 1}. ${email} (${user.id}) - metadata:`, user.public_metadata);
      });
    } else if (Array.isArray(clerkData)) {
      console.log(`📊 Found ${clerkData.length} active Clerk users in direct array`);
      
      clerkData.forEach((user, index) => {
        const email = user.email_addresses?.[0]?.email_address;
        console.log(`${index + 1}. ${email} (${user.id}) - metadata:`, user.public_metadata);
      });
    } else {
      console.log('❌ Unexpected response structure');
    }
    
  } catch (error) {
    console.error('❌ Error debugging Clerk users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugClerkUsers();
