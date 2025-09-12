const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Allowed email domains for internal users
const ALLOWED_DOMAINS = ['fitchannel.com', 'sdeal.com'];

function determineUserType(email, role) {
  if (role === 'ADMIN') return 'ADMIN';
  
  const isInternalDomain = ALLOWED_DOMAINS.some(domain => 
    email.toLowerCase().endsWith(domain.toLowerCase())
  );
  
  if (isInternalDomain) return 'EMPLOYEE';
  return 'CUSTOMER';
}

async function fixUserTypes() {
  console.log('🔧 Fixing user types...\n');

  try {
    // Find users without userType
    const usersWithoutType = await prisma.user.findMany({
      where: { userType: null },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    console.log(`📊 Found ${usersWithoutType.length} users without userType`);

    for (const user of usersWithoutType) {
      const userType = determineUserType(user.email, user.role);
      
      console.log(`\n👤 Updating ${user.name} (${user.email}):`);
      console.log(`   - Current role: ${user.role}`);
      console.log(`   - Determined userType: ${userType}`);
      
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          userType,
          isInternal: userType !== 'CUSTOMER'
        }
      });

      // Create employee record for internal users
      if (userType === 'EMPLOYEE' || userType === 'ADMIN') {
        const existingEmployee = await prisma.employees.findUnique({
          where: { userId: user.id }
        });

        if (!existingEmployee) {
          await prisma.employees.create({
            data: {
              id: user.id,
              userId: user.id,
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
          console.log(`   ✅ Created employee record`);
        } else {
          console.log(`   ⚠️  Employee record already exists`);
        }
      }

      console.log(`   ✅ Updated userType to ${userType}`);
    }

    console.log('\n✅ All user types fixed!');

    // Verify the fix
    const remainingUsersWithoutType = await prisma.user.count({
      where: { userType: null }
    });

    console.log(`\n📊 Users without userType after fix: ${remainingUsersWithoutType}`);

  } catch (error) {
    console.error('❌ Error fixing user types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserTypes();
