import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default quantities for each activity type
const defaultQuantities = {
  'SM-LI': 1,      // 1 LinkedIn post per week
  'SM-IG-P': 1,    // 1 Instagram post per week
  'SM-IG-S': 3,    // 3 Instagram stories per week
  'SM-FB': 1,      // 1 Facebook post per week
  'SM-TT': 1,      // 1 TikTok post per week
  'SEO-BLOG': 1,   // 1 SEO blog per month
  'EM-NL': 1,      // 1 newsletter per month
  'EM-QTR': 1,     // 1 quarterly newsletter
  'WEB-UPD': 2,    // 2 website updates per month
  'WEB-MULTI': 1,  // 1 multi-site management per month
  'SEA-MGMT': 1,   // 1 SEA campaign management per month
  'ADS-LI': 1,     // 1 LinkedIn ads campaign per month
  'EVENTS': 1,     // 1 event coordination per month
  'STRAT': 2,      // 2 strategy hours per month
  'REPORT': 1,     // 1 report per month
  'VIDEO': 0.25,   // 0.25 video project (quarterly)
  'PM': 4,         // 4 project management hours per month
  'FLEX': 2        // 2 flexible hours per month
};

async function main() {
  console.log('🌱 Seeding package activities...');

  try {
    // Get all packages
    const packages = await prisma.package.findMany({
      where: { isActive: true }
    });

    // Get all activity templates
    const activityTemplates = await prisma.activityTemplate.findMany({
      where: { isActive: true }
    });

    console.log(`Found ${packages.length} packages and ${activityTemplates.length} activity templates`);

    for (const pkg of packages) {
      console.log(`\n📦 Processing package: ${pkg.name}`);
      
      for (const template of activityTemplates) {
        const quantity = defaultQuantities[template.name as keyof typeof defaultQuantities] || 1;
        
        try {
          // Check if package activity already exists
          const existing = await prisma.packageActivity.findFirst({
            where: {
              packageId: pkg.id,
              activityTemplateId: template.id
            }
          });

          if (existing) {
            console.log(`  ✅ ${template.name} already exists, updating quantity to ${quantity}...`);
            await prisma.packageActivity.update({
              where: { id: existing.id },
              data: { quantity }
            });
          } else {
            console.log(`  ➕ Adding ${template.name} with quantity ${quantity}...`);
            await prisma.packageActivity.create({
              data: {
                packageId: pkg.id,
                activityTemplateId: template.id,
                quantity,
                isIncluded: true
              }
            });
          }
        } catch (error) {
          console.error(`  ❌ Error with ${template.name}:`, error);
        }
      }
    }

    console.log('\n✅ Package activities seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
