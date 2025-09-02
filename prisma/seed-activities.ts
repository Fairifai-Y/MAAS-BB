import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const activities = [
  {
    name: 'SM-LI',
    description: 'LinkedIn post - Plaatsen/ghostwriten + plaatsen',
    category: 'SOCIAL_MEDIA',
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SM-IG-P',
    description: 'Instagram post - Feed post',
    category: 'SOCIAL_MEDIA',
    estimatedHours: 1.5,
    isActive: true
  },
  {
    name: 'SM-IG-S',
    description: 'Instagram story - Stories per week',
    category: 'SOCIAL_MEDIA',
    estimatedHours: 1.0,
    isActive: true
  },
  {
    name: 'SM-FB',
    description: 'Facebook post',
    category: 'SOCIAL_MEDIA',
    estimatedHours: 1.0,
    isActive: true
  },
  {
    name: 'SM-TT',
    description: 'TikTok post',
    category: 'SOCIAL_MEDIA',
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SEO-BLOG',
    description: 'SEO-blog - Schrijven + publiceren',
    category: 'CONTENT',
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'EM-NL',
    description: 'Nieuwsbrief - Opmaak, copy, verzending',
    category: 'EMAIL_MARKETING',
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'EM-QTR',
    description: 'Nieuwsbrief (kwartaal)',
    category: 'EMAIL_MARKETING',
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'WEB-UPD',
    description: 'Website update/onderhoud - Content/kleine wijzigingen/SEO-aanpassingen',
    category: 'WEBSITE',
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'WEB-MULTI',
    description: 'Beheer meerdere (label-)sites - Operationeel beheer >1 site',
    category: 'WEBSITE',
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEA-MGMT',
    description: 'SEA-campagne beheer - Excl. ad spend',
    category: 'PAID_ADVERTISING',
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'ADS-LI',
    description: 'LinkedIn Ads - Campagnebeheer',
    category: 'PAID_ADVERTISING',
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'EVENTS',
    description: 'Events/merch/e-mailhandtekening - Productie/coördinatie',
    category: 'ADMINISTRATION',
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'STRAT',
    description: 'Strategie/plan - (of vast aantal u/pw)',
    category: 'CONSULTING',
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'REPORT',
    description: 'Rapportage',
    category: 'PAID_ADVERTISING',
    estimatedHours: 1.5,
    isActive: true
  },
  {
    name: 'VIDEO',
    description: 'Video/animatie (project) - Projectmatig',
    category: 'DESIGN',
    estimatedHours: 8.0,
    isActive: true
  },
  {
    name: 'PM',
    description: 'Projectmanagement - Planning/overleg',
    category: 'ADMINISTRATION',
    estimatedHours: 1.0,
    isActive: true
  },
  {
    name: 'FLEX',
    description: 'Flexibele schil - Ad-hoc gereserveerde uren',
    category: 'ADMINISTRATION',
    estimatedHours: 1.0,
    isActive: true
  }
];

async function main() {
  console.log('🌱 Seeding activity templates...');

  for (const activity of activities) {
    try {
      // Check if activity already exists
      const existing = await prisma.activityTemplate.findFirst({
        where: { name: activity.name }
      });

      if (existing) {
        console.log(`✅ Activity ${activity.name} already exists, updating...`);
        await prisma.activityTemplate.update({
          where: { id: existing.id },
          data: activity
        });
      } else {
        console.log(`➕ Creating activity ${activity.name}...`);
        await prisma.activityTemplate.create({
          data: activity
        });
      }
    } catch (error) {
      console.error(`❌ Error with activity ${activity.name}:`, error);
    }
  }

  console.log('✅ Activity templates seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
