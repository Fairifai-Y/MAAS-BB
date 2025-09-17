const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Backfilling costPrice = sellingPrice where costPrice is NULL...');

    // Find how many need backfill
    const toBackfill = await prisma.activityTemplate.count({
      where: { costPrice: null }
    });
    console.log(`📋 Templates needing backfill: ${toBackfill}`);

    if (toBackfill > 0) {
      // Prisma doesn't support updateMany with relation field in set; do two-step raw SQL for precision
      // But since we just mirror sellingPrice to costPrice, we can fetch and update in batches
      const batchSize = 200;
      let skipped = 0;
      for (;;) {
        const items = await prisma.activityTemplate.findMany({
          where: { costPrice: null },
          select: { id: true, sellingPrice: true },
          take: batchSize,
          skip: skipped,
          orderBy: { id: 'asc' }
        });
        if (items.length === 0) break;

        for (const item of items) {
          await prisma.activityTemplate.update({
            where: { id: item.id },
            data: { costPrice: item.sellingPrice }
          });
        }
        skipped += items.length;
        console.log(`✅ Backfilled ${skipped}/${toBackfill}`);
      }
    }

    const remaining = await prisma.activityTemplate.count({ where: { costPrice: null } });
    console.log(`🎉 Backfill complete. Remaining NULL costPrice: ${remaining}`);
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();


