import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Echte medewerkers
const employees = [
  {
    name: 'Rodi',
    email: 'rodi@fitchannel.com',
    hourlyRate: 75.00,
    isActive: true
  },
  {
    name: 'Babette',
    email: 'babette@fitchannel.com',
    hourlyRate: 75.00,
    isActive: true
  },
  {
    name: 'Niels',
    email: 'niels@fitchannel.com',
    hourlyRate: 75.00,
    isActive: true
  },
  {
    name: 'Mitch',
    email: 'mitch@fitchannel.com',
    hourlyRate: 75.00,
    isActive: true
  }
];

// Echte klanten
const customers = [
  {
    company: 'Scale MSP',
    email: 'info@scalemsp.com',
    phone: '+31 20 123 4567',
    address: 'Amsterdam, Nederland'
  },
  {
    company: 'MSP Mentor',
    email: 'info@mspmentor.com',
    phone: '+31 20 123 4568',
    address: 'Rotterdam, Nederland'
  },
  {
    company: 'Private Gym',
    email: 'info@privategym.com',
    phone: '+31 20 123 4569',
    address: 'Den Haag, Nederland'
  },
  {
    company: 'Fuji',
    email: 'info@fuji.com',
    phone: '+31 20 123 4570',
    address: 'Utrecht, Nederland'
  },
  {
    company: 'Florijnz',
    email: 'info@florijnz.com',
    phone: '+31 20 123 4571',
    address: 'Eindhoven, Nederland'
  },
  {
    company: 'OnSite',
    email: 'info@onsite.com',
    phone: '+31 20 123 4572',
    address: 'Groningen, Nederland'
  },
  {
    company: 'Remote IT / B Connect',
    email: 'info@remoteit.com',
    phone: '+31 20 123 4573',
    address: 'Tilburg, Nederland'
  },
  {
    company: 'RBK',
    email: 'info@rbk.com',
    phone: '+31 20 123 4574',
    address: 'Almere, Nederland'
  },
  {
    company: 'DJM',
    email: 'info@djm.com',
    phone: '+31 20 123 4575',
    address: 'Breda, Nederland'
  },
  {
    company: 'Er was Eens',
    email: 'info@erwaseens.com',
    phone: '+31 20 123 4576',
    address: 'Nijmegen, Nederland'
  },
  {
    company: 'Fitchannel.com',
    email: 'info@fitchannel.com',
    phone: '+31 20 123 4577',
    address: 'Amsterdam, Nederland'
  },
  {
    company: 'Checkkit',
    email: 'info@checkkit.com',
    phone: '+31 20 123 4578',
    address: 'Leiden, Nederland'
  },
  {
    company: 'Peter Zebra',
    email: 'info@peterzebra.com',
    phone: '+31 20 123 4579',
    address: 'Arnhem, Nederland'
  },
  {
    company: 'P&O',
    email: 'info@po.com',
    phone: '+31 20 123 4580',
    address: 'Zwolle, Nederland'
  },
  {
    company: 'Dragintra',
    email: 'info@dragintra.com',
    phone: '+31 20 123 4581',
    address: 'Maastricht, Nederland'
  },
  {
    company: 'CentSweets',
    email: 'info@centsweets.com',
    phone: '+31 20 123 4582',
    address: 'Leeuwarden, Nederland'
  },
  {
    company: 'Wolfe & Wolfe',
    email: 'info@wolfewolfe.com',
    phone: '+31 20 123 4583',
    address: 'Delft, Nederland'
  },
  {
    company: 'Animo',
    email: 'info@animo.com',
    phone: '+31 20 123 4584',
    address: 'Enschede, Nederland'
  },
  {
    company: 'Alf1 / Mstack / Haystack',
    email: 'info@alf1.com',
    phone: '+31 20 123 4585',
    address: 'Apeldoorn, Nederland'
  },
  {
    company: 'Imagineear',
    email: 'info@imagineear.com',
    phone: '+31 20 123 4586',
    address: 'Amersfoort, Nederland'
  }
];

// Werkzaamheden per klant (vereenvoudigd)
const customerWork = [
  { customer: 'Scale MSP', employee: 'Rodi', hoursPerMonth: 6, activities: ['SM-LI', 'SEO-BLOG', 'WEB-UPD', 'EVENTS'] },
  { customer: 'MSP Mentor', employee: 'Rodi', hoursPerMonth: 3, activities: ['SM-LI', 'EM-NL', 'SEO-BLOG', 'WEB-UPD', 'FLEX'] },
  { customer: 'Private Gym', employee: 'Rodi', hoursPerMonth: 1.5, activities: ['EM-NL', 'SEA-MGMT'] },
  { customer: 'Fuji', employee: 'Rodi', hoursPerMonth: 12, activities: ['SM-LI', 'SEO-BLOG', 'WEB-UPD', 'EM-NL', 'FLEX'] },
  { customer: 'Florijnz', employee: 'Rodi', hoursPerMonth: 18, activities: ['SM-LI', 'EM-QTR', 'WEB-UPD', 'FLEX'] },
  { customer: 'OnSite', employee: 'Rodi', hoursPerMonth: 4.5, activities: ['SM-LI', 'WEB-MULTI', 'SEO-BLOG', 'EM-QTR', 'FLEX'] },
  { customer: 'Remote IT / B Connect', employee: 'Rodi', hoursPerMonth: 5, activities: ['SM-LI', 'EM-NL', 'FLEX'] },
  { customer: 'RBK', employee: 'Rodi', hoursPerMonth: 11, activities: ['FLEX'] },
  { customer: 'DJM', employee: 'Babette', hoursPerMonth: 22, activities: ['SM-LI', 'SM-IG-P', 'SM-FB', 'SM-TT', 'SEO-BLOG', 'EM-NL', 'SEA-MGMT', 'FLEX'] },
  { customer: 'Er was Eens', employee: 'Babette', hoursPerMonth: 19.5, activities: ['SM-LI', 'SM-IG-P', 'SEO-BLOG', 'SEA-MGMT', 'FLEX'] },
  { customer: 'Fitchannel.com', employee: 'Babette', hoursPerMonth: 76, activities: ['SM-LI', 'SM-IG-P', 'SM-IG-S', 'EM-NL', 'SEO-BLOG', 'FLEX'] },
  { customer: 'Checkkit', employee: 'Babette', hoursPerMonth: 16, activities: ['STRAT'] },
  { customer: 'Peter Zebra', employee: 'Babette', hoursPerMonth: 14, activities: ['SM-LI', 'FLEX'] },
  { customer: 'P&O', employee: 'Babette', hoursPerMonth: 4, activities: ['SM-LI', 'FLEX'] },
  { customer: 'Dragintra', employee: 'Niels', hoursPerMonth: 19, activities: ['SM-LI', 'SEO-BLOG', 'EM-NL', 'WEB-MULTI', 'FLEX'] },
  { customer: 'CentSweets', employee: 'Niels', hoursPerMonth: 0.5, activities: ['SM-LI'] },
  { customer: 'Wolfe & Wolfe', employee: 'Niels', hoursPerMonth: 2, activities: ['SM-LI'] },
  { customer: 'Animo', employee: 'Niels', hoursPerMonth: 8.5, activities: ['SM-LI', 'SEO-BLOG', 'REPORT', 'FLEX'] },
  { customer: 'Alf1 / Mstack / Haystack', employee: 'Niels', hoursPerMonth: 1, activities: ['SM-LI', 'FLEX'] },
  { customer: 'Imagineear', employee: 'Mitch', hoursPerMonth: 12.5, activities: ['SM-LI', 'SEO-BLOG', 'SEA-MGMT', 'FLEX'] }
];

async function main() {
  console.log('🌱 Seeding real employees and customers...\n');

  // Verwijder alle bestaande mock data
  console.log('🗑️  Removing existing mock data...');
  await prisma.activity.deleteMany();
  await prisma.customer_packages.deleteMany();
  await prisma.customers.deleteMany();
  await prisma.employees.deleteMany();
  await prisma.user.deleteMany();

  // Voeg medewerkers toe
  console.log('\n👥 Adding employees...');
  const createdEmployees = [];
  
  for (const emp of employees) {
    try {
      // Maak eerst een user aan
      const user = await prisma.user.create({
        data: {
          clerkId: `clerk_${emp.name.toLowerCase()}`,
          email: emp.email,
          name: emp.name,
          role: 'EMPLOYEE'
        }
      });

      // Maak dan een employee aan
      const employee = await prisma.employees.create({
        data: {
          id: `emp_${emp.name.toLowerCase()}`,
          userId: user.id,
          hourlyRate: emp.hourlyRate,
          isActive: emp.isActive,
          updatedAt: new Date()
        }
      });

      createdEmployees.push({ ...emp, id: employee.id, userId: user.id });
      console.log(`✅ Added employee: ${emp.name}`);
    } catch (error) {
      console.error(`❌ Error adding employee ${emp.name}:`, error);
    }
  }

  // Voeg klanten toe
  console.log('\n🏢 Adding customers...');
  const createdCustomers = [];
  
  for (const cust of customers) {
    try {
      // Maak eerst een user aan
      const user = await prisma.user.create({
        data: {
          clerkId: `clerk_${cust.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          email: cust.email,
          name: cust.company,
          role: 'CUSTOMER'
        }
      });

      // Maak dan een customer aan
      const customer = await prisma.customers.create({
        data: {
          id: `cust_${cust.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          userId: user.id,
          company: cust.company,
          phone: cust.phone,
          address: cust.address,
          updatedAt: new Date()
        }
      });

      createdCustomers.push({ ...cust, id: customer.id, userId: user.id });
      console.log(`✅ Added customer: ${cust.company}`);
    } catch (error) {
      console.error(`❌ Error adding customer ${cust.company}:`, error);
    }
  }

  // Maak custom packages voor elke klant
  console.log('\n📦 Creating custom packages for customers...');
  
  for (const work of customerWork) {
    try {
      const customer = createdCustomers.find(c => c.company === work.customer);
      const employee = createdEmployees.find(e => e.name === work.employee);
      
      if (!customer || !employee) {
        console.log(`⚠️  Skipping ${work.customer} - customer or employee not found`);
        continue;
      }

      // Maak een custom package aan
      const package_ = await prisma.package.create({
        data: {
          name: `${work.customer} - Custom`,
          description: `Custom package for ${work.customer} managed by ${work.employee}`,
          maxHours: work.hoursPerMonth,
          price: work.hoursPerMonth * 75, // €75 per uur
          isActive: true
        }
      });

      // Koppel activiteiten aan het package
      for (const activityName of work.activities) {
        const activityTemplate = await prisma.activityTemplate.findFirst({
          where: { name: activityName }
        });

        if (activityTemplate) {
          await prisma.packageActivity.create({
            data: {
              packageId: package_.id,
              activityTemplateId: activityTemplate.id,
              quantity: 1,
              isIncluded: true
            }
          });
        }
      }

      // Maak een customer package aan
      await prisma.customer_packages.create({
        data: {
          id: `cp_${customer.id}_${package_.id}`,
          customerId: customer.id,
          packageId: package_.id,
          startDate: new Date(),
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });

      console.log(`✅ Created package for ${work.customer} (${work.hoursPerMonth}h/month)`);
    } catch (error) {
      console.error(`❌ Error creating package for ${work.customer}:`, error);
    }
  }

  console.log('\n✅ Real data seeding completed!');
  console.log(`📊 Summary:`);
  console.log(`- ${createdEmployees.length} employees added`);
  console.log(`- ${createdCustomers.length} customers added`);
  console.log(`- ${customerWork.length} custom packages created`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
