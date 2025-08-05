import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create MAAS packages
  const packages = [
    {
      name: 'MAAS-XS',
      description: 'Klein pakket voor startups en kleine bedrijven',
      maxHours: 10,
      price: 500.00,
      isActive: true
    },
    {
      name: 'MAAS-S',
      description: 'Groeipakket voor kleine bedrijven',
      maxHours: 25,
      price: 1200.00,
      isActive: true
    },
    {
      name: 'MAAS-M',
      description: 'Middenpakket voor groeiende organisaties',
      maxHours: 50,
      price: 2200.00,
      isActive: true
    },
    {
      name: 'MAAS-L',
      description: 'Groot pakket voor gevestigde bedrijven',
      maxHours: 100,
      price: 4000.00,
      isActive: true
    },
    {
      name: 'MAAS-XL',
      description: 'Enterprise pakket voor grote organisaties',
      maxHours: 200,
      price: 7500.00,
      isActive: true
    },
    {
      name: 'MAAS-XXL',
      description: 'Premium pakket voor multinationals',
      maxHours: 400,
      price: 14000.00,
      isActive: true
    }
  ]

  console.log('📦 Creating MAAS packages...')
  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg
    })
  }

  // Create test admin user
  console.log('👤 Creating test admin user...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@maas-platform.nl' },
    update: {},
    create: {
      clerkId: 'admin_test_user',
      email: 'admin@maas-platform.nl',
      name: 'Admin User',
      role: 'ADMIN',
      admin: {
        create: {
          permissions: ['manage_packages', 'manage_users', 'view_statistics']
        }
      }
    }
  })

  // Create test customer user
  console.log('👤 Creating test customer user...')
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      clerkId: 'customer_test_user',
      email: 'customer@example.com',
      name: 'Test Customer',
      role: 'CUSTOMER',
      customer: {
        create: {
          company: 'Test Company BV',
          phone: '+31 6 12345678',
          address: 'Teststraat 123, 1234 AB Amsterdam'
        }
      }
    }
  })

  // Create test employee user
  console.log('👤 Creating test employee user...')
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@maas-platform.nl' },
    update: {},
    create: {
      clerkId: 'employee_test_user',
      email: 'employee@maas-platform.nl',
      name: 'Test Employee',
      role: 'EMPLOYEE',
      employee: {
        create: {
          hourlyRate: 75.00,
          isActive: true
        }
      }
    }
  })

  // Create test customer package
  console.log('📋 Creating test customer package...')
  const maasPackage = await prisma.package.findUnique({
    where: { name: 'MAAS-M' }
  })

  if (maasPackage && customerUser.customer) {
    await prisma.customerPackage.upsert({
      where: { 
        customerId_packageId: {
          customerId: customerUser.customer.id,
          packageId: maasPackage.id
        }
      },
      update: {},
      create: {
        customerId: customerUser.customer.id,
        packageId: maasPackage.id,
        startDate: new Date(),
        status: 'ACTIVE'
      }
    })
  }

  console.log('✅ Database seeding completed!')
  console.log('\n📊 Test Data Summary:')
  console.log(`- ${packages.length} MAAS packages created`)
  console.log(`- Admin user: ${adminUser.email}`)
  console.log(`- Customer user: ${customerUser.email}`)
  console.log(`- Employee user: ${employeeUser.email}`)
  console.log('\n🔑 Test Credentials:')
  console.log('Admin: admin@maas-platform.nl')
  console.log('Customer: customer@example.com')
  console.log('Employee: employee@maas-platform.nl')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 