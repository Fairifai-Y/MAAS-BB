const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateUserTypes() {
  try {
    console.log('🔄 Migrating user types safely...\n');

    // Stap 1: Markeer interne medewerkers op basis van email
    const internalEmails = [
      'yuri@fitchannel.com',
      'admin@fitchannel.com'
    ];

    console.log('👥 Marking internal employees...');
    for (const email of internalEmails) {
      const result = await prisma.user.updateMany({
        where: { email },
        data: { 
          userType: 'EMPLOYEE',
          isInternal: true 
        }
      });
      if (result.count > 0) {
        console.log(`✅ Marked ${email} as EMPLOYEE`);
      } else {
        console.log(`⚠️  ${email} not found`);
      }
    }

    // Stap 2: Markeer admins
    console.log('\n👑 Marking admins...');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    for (const user of adminUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          userType: 'ADMIN',
          isInternal: true 
        }
      });
      console.log(`✅ Marked ${user.email} as ADMIN`);
    }

    // Stap 3: Markeer alle anderen als CUSTOMER
    console.log('\n🏢 Marking customers...');
    const customerResult = await prisma.user.updateMany({
      where: { 
        userType: null,
        isInternal: false 
      },
      data: { 
        userType: 'CUSTOMER',
        isInternal: false 
      }
    });
    console.log(`✅ Marked ${customerResult.count} users as CUSTOMER`);

    // Stap 4: Markeer employee records van klanten als inactief (veiliger)
    console.log('\n🧹 Marking employee records as inactive for customers...');
    const customerUsers = await prisma.user.findMany({
      where: { userType: 'CUSTOMER' },
      include: { employees: true }
    });

    let markedInactive = 0;
    for (const user of customerUsers) {
      if (user.employees) {
        try {
          await prisma.employees.update({
            where: { id: user.id },
            data: { 
              isActive: false,
              function: 'Customer (Inactive)',
              department: 'External'
            }
          });
          markedInactive++;
          console.log(`✅ Marked employee record as inactive for customer: ${user.email}`);
        } catch (error) {
          console.log(`⚠️  Could not update employee record for ${user.email}: ${error.message}`);
        }
      }
    }

    // Stap 5: Finale status
    console.log('\n📊 Final migration status:');
    const userTypeCounts = await prisma.user.groupBy({
      by: ['userType'],
      _count: { userType: true }
    });

    userTypeCounts.forEach(count => {
      console.log(`   - ${count.userType || 'NULL'}: ${count._count.userType} users`);
    });

    const employeeCount = await prisma.employees.count();
    console.log(`   - Employee records: ${employeeCount}`);

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`   - Marked ${markedInactive} employee records as inactive for customers`);
    console.log(`   - All users now have proper userType classification`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUserTypes();
