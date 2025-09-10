const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('🧹 Cleaning up potential duplicates...\n');

    // Check for duplicate users by email
    const duplicateUsers = await prisma.user.groupBy({
      by: ['email'],
      _count: {
        email: true
      },
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (duplicateUsers.length > 0) {
      console.log(`⚠️  Found ${duplicateUsers.length} duplicate emails:`);
      
      for (const dup of duplicateUsers) {
        console.log(`\n📧 Processing duplicates for: ${dup.email}`);
        
        // Get all users with this email
        const users = await prisma.user.findMany({
          where: { email: dup.email },
          include: { employees: true },
          orderBy: { createdAt: 'asc' }
        });

        console.log(`   Found ${users.length} users with this email`);
        
        // Keep the first user, delete the rest
        const keepUser = users[0];
        const deleteUsers = users.slice(1);
        
        console.log(`   Keeping: ${keepUser.name} (${keepUser.id}) - Created: ${keepUser.createdAt}`);
        
        for (const deleteUser of deleteUsers) {
          console.log(`   Deleting: ${deleteUser.name} (${deleteUser.id}) - Created: ${deleteUser.createdAt}`);
          
          // Delete employee record first (if exists)
          if (deleteUser.employees) {
            await prisma.employees.delete({
              where: { id: deleteUser.id }
            });
            console.log(`     ✅ Deleted employee record`);
          }
          
          // Delete user
          await prisma.user.delete({
            where: { id: deleteUser.id }
          });
          console.log(`     ✅ Deleted user record`);
        }
      }
    } else {
      console.log('✅ No duplicate users found');
    }

    // Check for orphaned employee records
    const allEmployees = await prisma.employees.findMany({
      include: { users: true }
    });
    
    const orphanedEmployees = allEmployees.filter(emp => !emp.users);

    if (orphanedEmployees.length > 0) {
      console.log(`\n⚠️  Found ${orphanedEmployees.length} orphaned employee records:`);
      
      for (const employee of orphanedEmployees) {
        console.log(`   Deleting orphaned employee: ${employee.id}`);
        await prisma.employees.delete({
          where: { id: employee.id }
        });
        console.log(`   ✅ Deleted orphaned employee record`);
      }
    } else {
      console.log('\n✅ No orphaned employee records found');
    }

    // Final count
    const finalUserCount = await prisma.user.count();
    const finalEmployeeCount = await prisma.employees.count();

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`📊 Final counts:`);
    console.log(`   - Users: ${finalUserCount}`);
    console.log(`   - Employees: ${finalEmployeeCount}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
