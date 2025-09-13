const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateActivityTemplatePrices() {
  try {
    console.log('🔄 Updating activity template prices to €75...');
    
    // First, let's see what we have
    const allTemplates = await prisma.activityTemplate.findMany({
      select: {
        id: true,
        name: true,
        sellingPrice: true
      }
    });

    console.log(`📋 Found ${allTemplates.length} activity templates`);
    
    // Update all activity templates to have sellingPrice of 75
    const result = await prisma.activityTemplate.updateMany({
      data: {
        sellingPrice: 75.00
      }
    });

    console.log(`✅ Updated ${result.count} activity templates with selling price €75`);

    // Show all templates with their new prices
    const templates = await prisma.activityTemplate.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        estimatedHours: true,
        sellingPrice: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('\n📋 Current activity templates:');
    templates.forEach(template => {
      console.log(`- ${template.name} (${template.category}): ${template.estimatedHours}h @ €${template.sellingPrice}/h`);
    });

  } catch (error) {
    console.error('❌ Error updating activity template prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateActivityTemplatePrices();
