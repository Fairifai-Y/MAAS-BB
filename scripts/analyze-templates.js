const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeTemplates() {
  try {
    console.log('🔍 Analyzing activity templates...\n');

    // Get all activity templates
    const templates = await prisma.activityTemplate.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${templates.length} activity templates:\n`);

    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name}`);
      console.log(`   - Category: ${template.category}`);
      console.log(`   - Estimated Hours: ${template.estimatedHours}h`);
      console.log(`   - Description: ${template.description}`);
      console.log(`   - Active: ${template.isActive}`);
      console.log('');
    });

    // Get package activities
    const packageActivities = await prisma.packageActivity.findMany({
      include: {
        activityTemplate: true,
        package: true
      }
    });

    console.log(`📦 Package Activities: ${packageActivities.length}`);
    console.log('   Templates used in packages:\n');

    const templateUsage = {};
    packageActivities.forEach(pa => {
      const templateName = pa.activityTemplate.name;
      if (!templateUsage[templateName]) {
        templateUsage[templateName] = [];
      }
      templateUsage[templateName].push({
        package: pa.package.name,
        quantity: pa.quantity
      });
    });

    Object.entries(templateUsage).forEach(([templateName, packages]) => {
      console.log(`   - ${templateName}:`);
      packages.forEach(pkg => {
        console.log(`     * ${pkg.package} (${pkg.quantity}x)`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error analyzing templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeTemplates();
