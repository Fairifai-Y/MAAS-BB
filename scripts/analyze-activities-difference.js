const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeActivitiesDifference() {
  try {
    console.log('🔍 Analysing the difference between ActivityTemplate and Activity models...\n');

    // Get ActivityTemplates
    const activityTemplates = await prisma.activityTemplate.findMany({
      orderBy: { name: 'asc' }
    });

    // Get Activities
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
      orderBy: { createdAt: 'desc' }
    });

    // Get PackageActivities (the bridge between templates and packages)
    const packageActivities = await prisma.packageActivity.findMany({
      include: {
        activityTemplate: true,
        package: true
      }
    });

    console.log('📊 DATABASE OVERVIEW:');
    console.log(`   - Activity Templates: ${activityTemplates.length}`);
    console.log(`   - Package Activities: ${packageActivities.length}`);
    console.log(`   - Actual Activities: ${activities.length}\n`);

    console.log('🏗️  ACTIVITY TEMPLATES (Templates/Sjablonen):');
    console.log('   Purpose: Reusable templates for different types of work');
    console.log('   Usage: Used to create packages and define what work can be done\n');
    
    if (activityTemplates.length > 0) {
      console.log('   Examples:');
      activityTemplates.slice(0, 5).forEach(template => {
        console.log(`   - ${template.name} (${template.category}) - ${template.estimatedHours}h`);
      });
      if (activityTemplates.length > 5) {
        console.log(`   ... and ${activityTemplates.length - 5} more`);
      }
    }
    console.log('');

    console.log('📦 PACKAGE ACTIVITIES (Bridge Table):');
    console.log('   Purpose: Links Activity Templates to Packages');
    console.log('   Usage: Defines which templates are included in which packages\n');
    
    if (packageActivities.length > 0) {
      console.log('   Examples:');
      packageActivities.slice(0, 3).forEach(pa => {
        console.log(`   - Package "${pa.package.name}" includes "${pa.activityTemplate.name}" (${pa.quantity}x)`);
      });
      if (packageActivities.length > 3) {
        console.log(`   ... and ${packageActivities.length - 3} more`);
      }
    }
    console.log('');

    console.log('⚡ ACTUAL ACTIVITIES (Real Work Done):');
    console.log('   Purpose: Records of actual work performed by employees');
    console.log('   Usage: Tracks time spent, status, and completion\n');
    
    if (activities.length > 0) {
      console.log('   Examples:');
      activities.slice(0, 3).forEach(activity => {
        const customer = activity.customer_packages.customers.users.name;
        const employee = activity.employees.users.name;
        const packageName = activity.customer_packages.packages.name;
        console.log(`   - ${activity.description} (${activity.hours}h) - ${employee} for ${customer} (${packageName})`);
        console.log(`     Status: ${activity.status} | Date: ${activity.date.toISOString().split('T')[0]}`);
      });
      if (activities.length > 3) {
        console.log(`   ... and ${activities.length - 3} more`);
      }
    }
    console.log('');

    console.log('🔄 WORKFLOW EXPLANATION:');
    console.log('   1. Admin creates Activity Templates (e.g., "Website Design", "SEO Optimization")');
    console.log('   2. Admin creates Packages and assigns Activity Templates to them');
    console.log('   3. Customers purchase Packages');
    console.log('   4. Employees perform actual work and create Activities');
    console.log('   5. Activities are linked to customer packages and track real time spent\n');

    console.log('📋 KEY DIFFERENCES:');
    console.log('   ActivityTemplate:');
    console.log('   - Static templates/sjablonen');
    console.log('   - Define what work CAN be done');
    console.log('   - Have estimated hours');
    console.log('   - Categorized (WEBSITE, SEO, etc.)');
    console.log('   - Reusable across packages\n');

    console.log('   Activity:');
    console.log('   - Dynamic records of actual work');
    console.log('   - Track what work WAS done');
    console.log('   - Have actual hours spent');
    console.log('   - Linked to specific customer and employee');
    console.log('   - Have status (PENDING, APPROVED, etc.)\n');

    console.log('   PackageActivity:');
    console.log('   - Bridge between templates and packages');
    console.log('   - Defines which templates are in which packages');
    console.log('   - Can specify quantity (how many times included)\n');

  } catch (error) {
    console.error('❌ Error analyzing activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeActivitiesDifference();
