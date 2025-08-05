import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@maas-platform.com' },
    update: {},
    create: {
      email: 'admin@maas-platform.com',
      name: 'Admin User',
      clerkId: 'admin_clerk_id_123'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jan@jansen.com' },
    update: {},
    create: {
      email: 'jan@jansen.com',
      name: 'Jan Jansen',
      clerkId: 'jan_clerk_id_456'
    }
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'piet@pietersen.com' },
    update: {},
    create: {
      email: 'piet@pietersen.com',
      name: 'Piet Pietersen',
      clerkId: 'piet_clerk_id_789'
    }
  });

  console.log('✅ Users created');

  // Create activity templates
  const activityTemplates = await Promise.all([
    prisma.activityTemplate.upsert({
      where: { id: 'template-1' },
      update: {},
      create: {
        id: 'template-1',
        name: 'Website Onderhoud',
        description: 'Regelmatig onderhoud en updates van websites',
        category: 'WEBSITE',
        estimatedHours: 4.0
      }
    }),
    prisma.activityTemplate.upsert({
      where: { id: 'template-2' },
      update: {},
      create: {
        id: 'template-2',
        name: 'Database Optimalisatie',
        description: 'Performance optimalisatie van databases',
        category: 'TECHNICAL',
        estimatedHours: 6.0
      }
    }),
    prisma.activityTemplate.upsert({
      where: { id: 'template-3' },
      update: {},
      create: {
        id: 'template-3',
        name: 'Security Audit',
        description: 'Uitgebreide security audit van systemen',
        category: 'TECHNICAL',
        estimatedHours: 8.0
      }
    }),
    prisma.activityTemplate.upsert({
      where: { id: 'template-4' },
      update: {},
      create: {
        id: 'template-4',
        name: 'Backup Configuratie',
        description: 'Instellen en configureren van backup systemen',
        category: 'TECHNICAL',
        estimatedHours: 3.0
      }
    }),
    prisma.activityTemplate.upsert({
      where: { id: 'template-5' },
      update: {},
      create: {
        id: 'template-5',
        name: 'Performance Monitoring',
        description: 'Instellen van monitoring en alerting systemen',
        category: 'TECHNICAL',
        estimatedHours: 5.0
      }
    }),
    prisma.activityTemplate.upsert({
      where: { id: 'template-6' },
      update: {},
      create: {
        id: 'template-6',
        name: 'SEO Optimalisatie',
        description: 'Search Engine Optimization voor websites',
        category: 'SEO',
        estimatedHours: 4.0
      }
    }),
    prisma.activityTemplate.upsert({
      where: { id: 'template-7' },
      update: {},
      create: {
        id: 'template-7',
        name: 'Content Creatie',
        description: 'Schrijven van blog posts en content',
        category: 'CONTENT',
        estimatedHours: 3.0
      }
    }),
    prisma.activityTemplate.upsert({
      where: { id: 'template-8' },
      update: {},
      create: {
        id: 'template-8',
        name: 'Social Media Management',
        description: 'Beheer van social media accounts',
        category: 'SOCIAL_MEDIA',
        estimatedHours: 2.0
      }
    })
  ]);

  console.log('✅ Activity templates created');

  // Create packages
  const package1 = await prisma.package.upsert({
    where: { id: 'package-1' },
    update: {},
    create: {
      id: 'package-1',
      name: 'Starter Package',
      description: 'Basis onderhoud en support',
      maxHours: 20,
      price: 500.0
    }
  });

  const package2 = await prisma.package.upsert({
    where: { id: 'package-2' },
    update: {},
    create: {
      id: 'package-2',
      name: 'Professional Package',
      description: 'Uitgebreid onderhoud en optimalisatie',
      maxHours: 40,
      price: 1000.0
    }
  });

  const package3 = await prisma.package.upsert({
    where: { id: 'package-3' },
    update: {},
    create: {
      id: 'package-3',
      name: 'Enterprise Package',
      description: 'Volledig managed service',
      maxHours: 80,
      price: 2000.0
    }
  });

  console.log('✅ Packages created');

  // Create package activities
  await Promise.all([
    prisma.packageActivity.upsert({
      where: { id: 'pa-1' },
      update: {},
      create: {
        id: 'pa-1',
        packageId: package1.id,
        activityTemplateId: 'template-1',
        quantity: 2
      }
    }),
    prisma.packageActivity.upsert({
      where: { id: 'pa-2' },
      update: {},
      create: {
        id: 'pa-2',
        packageId: package1.id,
        activityTemplateId: 'template-4',
        quantity: 1
      }
    }),
    prisma.packageActivity.upsert({
      where: { id: 'pa-3' },
      update: {},
      create: {
        id: 'pa-3',
        packageId: package2.id,
        activityTemplateId: 'template-1',
        quantity: 3
      }
    }),
    prisma.packageActivity.upsert({
      where: { id: 'pa-4' },
      update: {},
      create: {
        id: 'pa-4',
        packageId: package2.id,
        activityTemplateId: 'template-2',
        quantity: 2
      }
    }),
    prisma.packageActivity.upsert({
      where: { id: 'pa-5' },
      update: {},
      create: {
        id: 'pa-5',
        packageId: package2.id,
        activityTemplateId: 'template-5',
        quantity: 1
      }
    }),
    prisma.packageActivity.upsert({
      where: { id: 'pa-6' },
      update: {},
      create: {
        id: 'pa-6',
        packageId: package3.id,
        activityTemplateId: 'template-1',
        quantity: 4
      }
    }),
    prisma.packageActivity.upsert({
      where: { id: 'pa-7' },
      update: {},
      create: {
        id: 'pa-7',
        packageId: package3.id,
        activityTemplateId: 'template-2',
        quantity: 3
      }
    }),
    prisma.packageActivity.upsert({
      where: { id: 'pa-8' },
      update: {},
      create: {
        id: 'pa-8',
        packageId: package3.id,
        activityTemplateId: 'template-3',
        quantity: 2
      }
    })
  ]);

  console.log('✅ Package activities created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 