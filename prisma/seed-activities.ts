import { PrismaClient, ActivityCategory } from '@prisma/client';

const prisma = new PrismaClient();

const activities: {
  name: string;
  description: string;
  category: ActivityCategory;
  estimatedHours: number;
  isActive: boolean;
}[] = [
  {
    name: 'SEO',
    description: 'SEO optimalisatie - Per pagina',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'CONTENT',
    description: 'Content creatie - Per artikel',
    category: ActivityCategory.CONTENT,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'DESIGN',
    description: 'Design - Per pagina/component',
    category: ActivityCategory.DESIGN,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'DEVELOPMENT',
    description: 'Development - Per feature/component',
    category: ActivityCategory.TECHNICAL,
    estimatedHours: 8.0,
    isActive: true
  },
  {
    name: 'PAID_ADVERTISING',
    description: 'Betaalde advertenties - Campagne setup',
    category: ActivityCategory.PAID_ADVERTISING,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SOCIAL_MEDIA',
    description: 'Social media beheer - Per platform',
    category: ActivityCategory.SOCIAL_MEDIA,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'EMAIL_MARKETING',
    description: 'E-mail marketing - Per campagne',
    category: ActivityCategory.EMAIL_MARKETING,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'CONSULTING',
    description: 'Consultancy - Per uur',
    category: ActivityCategory.CONSULTING,
    estimatedHours: 1.0,
    isActive: true
  },
  {
    name: 'ADMINISTRATION',
    description: 'Administratie - Per taak',
    category: ActivityCategory.ADMINISTRATION,
    estimatedHours: 1.0,
    isActive: true
  },
  {
    name: 'ANALYTICS',
    description: 'Analytics & rapportage - Per rapport',
    category: ActivityCategory.TECHNICAL,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'CRO',
    description: 'Conversion rate optimalisatie - Per test',
    category: ActivityCategory.TECHNICAL,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'TECHNICAL_SEO',
    description: 'Technische SEO - Per issue',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'LINK_BUILDING',
    description: 'Link building - Per link',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'LOCAL_SEO',
    description: 'Local SEO - Per locatie',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'E_COMMERCE_SEO',
    description: 'E-commerce SEO - Per product categorie',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'VIDEO_SEO',
    description: 'Video SEO - Per video',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'MOBILE_SEO',
    description: 'Mobile SEO - Per issue',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'INTERNATIONAL_SEO',
    description: 'Internationale SEO - Per taal/regio',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_AUDIT',
    description: 'SEO audit - Per website',
    category: ActivityCategory.SEO,
    estimatedHours: 8.0,
    isActive: true
  },
  {
    name: 'COMPETITOR_ANALYSIS',
    description: 'Concurrentie analyse - Per concurrent',
    category: ActivityCategory.CONSULTING,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'KEYWORD_RESEARCH',
    description: 'Keyword onderzoek - Per set',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'ON_PAGE_SEO',
    description: 'On-page SEO - Per pagina',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'OFF_PAGE_SEO',
    description: 'Off-page SEO - Per activiteit',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_STRATEGY',
    description: 'SEO strategie - Per plan',
    category: ActivityCategory.SEO,
    estimatedHours: 6.0,
    isActive: true
  },
  {
    name: 'SEO_TRAINING',
    description: 'SEO training - Per sessie',
    category: ActivityCategory.CONSULTING,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_CONSULTING',
    description: 'SEO consultancy - Per uur',
    category: ActivityCategory.CONSULTING,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SEO_REPORTING',
    description: 'SEO rapportage - Per periode',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SEO_MAINTENANCE',
    description: 'SEO onderhoud - Per maand',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_CRISIS_MANAGEMENT',
    description: 'SEO crisis management - Per incident',
    category: ActivityCategory.SEO,
    estimatedHours: 8.0,
    isActive: true
  },
  {
    name: 'SEO_MIGRATION',
    description: 'SEO migratie - Per project',
    category: ActivityCategory.SEO,
    estimatedHours: 16.0,
    isActive: true
  },
  {
    name: 'SEO_PERFORMANCE',
    description: 'SEO performance optimalisatie - Per metric',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_USER_EXPERIENCE',
    description: 'SEO user experience - Per pagina',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_ACCESSIBILITY',
    description: 'SEO toegankelijkheid - Per issue',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SEO_STRUCTURE',
    description: 'SEO structuur - Per website',
    category: ActivityCategory.SEO,
    estimatedHours: 6.0,
    isActive: true
  },
  {
    name: 'SEO_CONTENT_STRATEGY',
    description: 'SEO content strategie - Per plan',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_TECHNICAL_OPTIMIZATION',
    description: 'SEO technische optimalisatie - Per issue',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_LOCAL_OPTIMIZATION',
    description: 'SEO lokale optimalisatie - Per locatie',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SEO_E_COMMERCE_OPTIMIZATION',
    description: 'SEO e-commerce optimalisatie - Per categorie',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_VIDEO_OPTIMIZATION',
    description: 'SEO video optimalisatie - Per video',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SEO_MOBILE_OPTIMIZATION',
    description: 'SEO mobile optimalisatie - Per issue',
    category: ActivityCategory.SEO,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'SEO_INTERNATIONAL_OPTIMIZATION',
    description: 'SEO internationale optimalisatie - Per taal',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_AUDIT_COMPREHENSIVE',
    description: 'SEO uitgebreide audit - Per website',
    category: ActivityCategory.SEO,
    estimatedHours: 12.0,
    isActive: true
  },
  {
    name: 'SEO_COMPETITOR_ANALYSIS_DEEP',
    description: 'SEO diepgaande concurrentie analyse - Per concurrent',
    category: ActivityCategory.CONSULTING,
    estimatedHours: 6.0,
    isActive: true
  },
  {
    name: 'SEO_KEYWORD_RESEARCH_ADVANCED',
    description: 'SEO geavanceerd keyword onderzoek - Per set',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_ON_PAGE_OPTIMIZATION',
    description: 'SEO on-page optimalisatie - Per pagina',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_OFF_PAGE_OPTIMIZATION',
    description: 'SEO off-page optimalisatie - Per activiteit',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_STRATEGY_COMPREHENSIVE',
    description: 'SEO uitgebreide strategie - Per plan',
    category: ActivityCategory.SEO,
    estimatedHours: 8.0,
    isActive: true
  },
  {
    name: 'SEO_TRAINING_ADVANCED',
    description: 'SEO geavanceerde training - Per sessie',
    category: ActivityCategory.CONSULTING,
    estimatedHours: 6.0,
    isActive: true
  },
  {
    name: 'SEO_CONSULTING_STRATEGIC',
    description: 'SEO strategische consultancy - Per uur',
    category: ActivityCategory.CONSULTING,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_REPORTING_ADVANCED',
    description: 'SEO geavanceerde rapportage - Per periode',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_MAINTENANCE_PREMIUM',
    description: 'SEO premium onderhoud - Per maand',
    category: ActivityCategory.SEO,
    estimatedHours: 6.0,
    isActive: true
  },
  {
    name: 'SEO_CRISIS_MANAGEMENT_URGENT',
    description: 'SEO urgente crisis management - Per incident',
    category: ActivityCategory.SEO,
    estimatedHours: 12.0,
    isActive: true
  },
  {
    name: 'SEO_MIGRATION_COMPLEX',
    description: 'SEO complexe migratie - Per project',
    category: ActivityCategory.SEO,
    estimatedHours: 24.0,
    isActive: true
  },
  {
    name: 'SEO_PERFORMANCE_ADVANCED',
    description: 'SEO geavanceerde performance optimalisatie - Per metric',
    category: ActivityCategory.SEO,
    estimatedHours: 6.0,
    isActive: true
  },
  {
    name: 'SEO_USER_EXPERIENCE_ADVANCED',
    description: 'SEO geavanceerde user experience - Per pagina',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_ACCESSIBILITY_ADVANCED',
    description: 'SEO geavanceerde toegankelijkheid - Per issue',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_STRUCTURE_COMPREHENSIVE',
    description: 'SEO uitgebreide structuur - Per website',
    category: ActivityCategory.SEO,
    estimatedHours: 8.0,
    isActive: true
  },
  {
    name: 'SEO_CONTENT_STRATEGY_ADVANCED',
    description: 'SEO geavanceerde content strategie - Per plan',
    category: ActivityCategory.SEO,
    estimatedHours: 6.0,
    isActive: true
  },
  {
    name: 'SEO_TECHNICAL_OPTIMIZATION_ADVANCED',
    description: 'SEO geavanceerde technische optimalisatie - Per issue',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEO_LOCAL_OPTIMIZATION_ADVANCED',
    description: 'SEO geavanceerde lokale optimalisatie - Per locatie',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_E_COMMERCE_OPTIMIZATION_ADVANCED',
    description: 'SEO geavanceerde e-commerce optimalisatie - Per categorie',
    category: ActivityCategory.SEO,
    estimatedHours: 6.0,
    isActive: true
  },
  {
    name: 'SEO_VIDEO_OPTIMIZATION_ADVANCED',
    description: 'SEO geavanceerde video optimalisatie - Per video',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_MOBILE_OPTIMIZATION_ADVANCED',
    description: 'SEO geavanceerde mobile optimalisatie - Per issue',
    category: ActivityCategory.SEO,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'SEO_INTERNATIONAL_OPTIMIZATION_ADVANCED',
    description: 'SEO geavanceerde internationale optimalisatie - Per taal',
    category: ActivityCategory.SEO,
    estimatedHours: 4.0,
    isActive: true
  },
  {
    name: 'SEA-MGMT',
    description: 'SEA-campagne beheer - Excl. ad spend',
    category: ActivityCategory.PAID_ADVERTISING,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'ADS-LI',
    description: 'LinkedIn Ads - Campagnebeheer',
    category: ActivityCategory.PAID_ADVERTISING,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'EVENTS',
    description: 'Events/merch/e-mailhandtekening - Productie/coördinatie',
    category: ActivityCategory.ADMINISTRATION,
    estimatedHours: 3.0,
    isActive: true
  },
  {
    name: 'STRAT',
    description: 'Strategie/plan - (of vast aantal u/pw)',
    category: ActivityCategory.CONSULTING,
    estimatedHours: 2.0,
    isActive: true
  },
  {
    name: 'REPORT',
    description: 'Rapportage',
    category: ActivityCategory.PAID_ADVERTISING,
    estimatedHours: 1.5,
    isActive: true
  },
  {
    name: 'VIDEO',
    description: 'Video/animatie (project) - Projectmatig',
    category: ActivityCategory.DESIGN,
    estimatedHours: 8.0,
    isActive: true
  },
  {
    name: 'PM',
    description: 'Projectmanagement - Planning/overleg',
    category: ActivityCategory.ADMINISTRATION,
    estimatedHours: 1.0,
    isActive: true
  },
  {
    name: 'FLEX',
    description: 'Flexibele schil - Ad-hoc gereserveerde uren',
    category: ActivityCategory.ADMINISTRATION,
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
