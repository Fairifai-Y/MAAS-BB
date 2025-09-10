const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyTemplateCopy() {
  try {
    console.log('🔍 Verifying template to activity copy...\n');

    // Get all templates
    const templates = await prisma.activityTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    // Get all activities
    const activities = await prisma.activity.findMany({
      include: {
        customer_packages: {
          include: {
            customers: { include: { users: true } },
            packages: true
          }
        },
        employees: { include: { users: true } }
      },
      orderBy: { description: 'asc' }
    });

    console.log(`📊 Summary:`);
    console.log(`   - Templates: ${templates.length}`);
    console.log(`   - Activities: ${activities.length}\n`);

    // Check if all templates have corresponding activities
    console.log('🔍 Checking template coverage:\n');

    let matchedCount = 0;
    let unmatchedTemplates = [];

    for (const template of templates) {
      const matchingActivity = activities.find(activity => 
        activity.description === template.name
      );

      if (matchingActivity) {
        console.log(`✅ ${template.name}`);
        console.log(`   - Template: ${template.estimatedHours}h (${template.category})`);
        console.log(`   - Activity: ${matchingActivity.hours}h (${matchingActivity.status})`);
        console.log(`   - Employee: ${matchingActivity.employees.users.name}`);
        console.log(`   - Customer: ${matchingActivity.customer_packages.customers.users.name}`);
        console.log('');
        matchedCount++;
      } else {
        unmatchedTemplates.push(template);
        console.log(`❌ ${template.name} - No matching activity found`);
      }
    }

    console.log(`📈 Coverage Results:`);
    console.log(`   - Matched: ${matchedCount}/${templates.length} (${Math.round(matchedCount/templates.length*100)}%)`);
    console.log(`   - Unmatched: ${unmatchedTemplates.length}`);

    if (unmatchedTemplates.length > 0) {
      console.log(`\n⚠️  Unmatched templates:`);
      unmatchedTemplates.forEach(template => {
        console.log(`   - ${template.name} (${template.category})`);
      });
    }

    // Check for activities without templates
    console.log(`\n🔍 Checking for activities without templates:`);
    const activitiesWithoutTemplates = activities.filter(activity => 
      !templates.find(template => template.name === activity.description)
    );

    if (activitiesWithoutTemplates.length > 0) {
      console.log(`   Found ${activitiesWithoutTemplates.length} activities without templates:`);
      activitiesWithoutTemplates.forEach(activity => {
        console.log(`   - ${activity.description} (${activity.hours}h)`);
      });
    } else {
      console.log(`   ✅ All activities have corresponding templates`);
    }

    // Category breakdown
    console.log(`\n📊 Category Breakdown:`);
    const categoryCount = {};
    activities.forEach(activity => {
      const template = templates.find(t => t.name === activity.description);
      if (template) {
        categoryCount[template.category] = (categoryCount[template.category] || 0) + 1;
      }
    });

    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} activities`);
    });

    console.log(`\n🎉 Verification completed!`);

  } catch (error) {
    console.error('❌ Error verifying template copy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTemplateCopy();
