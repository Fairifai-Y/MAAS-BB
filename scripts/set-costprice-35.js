const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Setting costPrice = 35 for all activity templates...');
    const result = await prisma.activityTemplate.updateMany({
      data: { costPrice: 35.0 }
    });
    console.log(`✅ Updated ${result.count} templates to costPrice=35`);
  } catch (error) {
    console.error('❌ Failed to set costPrice:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
