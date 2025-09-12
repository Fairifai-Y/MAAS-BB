const https = require('https');
const fs = require('fs');

// Load environment variables manually
function loadEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        envVars[key.trim()] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.log(`⚠️  Could not load ${filePath}: ${error.message}`);
    return {};
  }
}

async function testClerkConnection() {
  console.log('🧪 Testing Clerk Connection...\n');

  // Load environment variables
  const envVars = loadEnvFile('.env.local');
  Object.assign(process.env, envVars);

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  console.log('📊 Environment Variables:');
  console.log(`   - CLERK_SECRET_KEY: ${clerkSecretKey ? 'Set (length: ' + clerkSecretKey.length + ')' : 'Missing'}`);
  console.log(`   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? 'Set (length: ' + clerkPublishableKey.length + ')' : 'Missing'}\n`);

  if (!clerkSecretKey) {
    console.error('❌ CLERK_SECRET_KEY is not set in .env.local');
    return;
  }

  if (!clerkPublishableKey) {
    console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set in .env.local');
    return;
  }

  // Test a simple Clerk API call
  const testUserId = 'user_test123'; // This will fail but we can see the response
  
  const options = {
    hostname: 'api.clerk.com',
    port: 443,
    path: `/v1/users/${testUserId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Fitchannel-Platform/1.0'
    }
  };

  console.log('🔗 Testing Clerk API connection...');
  console.log(`   - URL: https://${options.hostname}${options.path}`);
  console.log(`   - Method: ${options.method}`);

  const req = https.request(options, (res) => {
    console.log(`\n📡 Response Status: ${res.statusCode}`);
    console.log(`📡 Response Headers:`, JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📄 Response Body:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (error) {
        console.log(data);
      }
      
      if (res.statusCode === 404) {
        console.log('\n✅ Clerk API is working! (404 is expected for test user)');
      } else if (res.statusCode === 200) {
        console.log('\n✅ Clerk API is working! (Unexpected success)');
      } else if (res.statusCode === 401) {
        console.log('\n❌ Clerk API authentication failed - check your secret key');
      } else {
        console.log(`\n⚠️  Unexpected status code: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Clerk API Error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('   - DNS resolution failed - check your internet connection');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   - Connection refused - check if Clerk API is accessible');
    }
  });

  req.setTimeout(10000, () => {
    console.error('❌ Request timeout after 10 seconds');
    req.destroy();
  });

  req.end();
}

testClerkConnection();
