const https = require('https');

async function testClerkAPI() {
  console.log('🧪 Testing Clerk API connection...\n');

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  console.log('📊 Environment Variables:');
  console.log(`   - CLERK_SECRET_KEY: ${clerkSecretKey ? 'Set' : 'Missing'}`);
  console.log(`   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? 'Set' : 'Missing'}\n`);

  if (!clerkSecretKey) {
    console.error('❌ CLERK_SECRET_KEY is not set');
    return;
  }

  if (!clerkPublishableKey) {
    console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    return;
  }

  // Test Clerk API connection
  const options = {
    hostname: 'api.clerk.com',
    port: 443,
    path: '/v1/users',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
    }
  };

  console.log('🔗 Testing Clerk API connection...');
  console.log(`   - URL: https://${options.hostname}${options.path}`);
  console.log(`   - Method: ${options.method}`);

  const req = https.request(options, (res) => {
    console.log(`\n📡 Response Status: ${res.statusCode}`);
    console.log(`📡 Response Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n✅ Clerk API Response:');
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (error) {
        console.log('\n📄 Raw Response:');
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Clerk API Error:', error);
  });

  req.end();
}

testClerkAPI();
