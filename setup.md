# MAAS Platform Setup Guide

## 🚀 Snelle Setup

### 1. Environment Variabelen Configureren

Maak een `.env.local` bestand aan in de root van het project:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/maas_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Rompslomp.nl API
ROMPLOMP_API_KEY=your_rompslomp_api_key
ROMPLOMP_API_URL=https://api.rompslomp.nl

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

```bash
# Genereer Prisma client
npx prisma generate

# Push schema naar database
npx prisma db push

# Seed database met test data
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

## 🔧 Diensten Configureren

### Clerk Authentication

1. Ga naar [clerk.com](https://clerk.com)
2. Maak een nieuwe applicatie aan
3. Kopieer de publishable key en secret key
4. Voeg de keys toe aan je `.env.local`

### Stripe Payments

1. Ga naar [stripe.com](https://stripe.com)
2. Maak een account aan
3. Ga naar Developers > API keys
4. Kopieer de publishable key en secret key
5. Configureer webhooks voor de volgende events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Rompslomp.nl API

1. Neem contact op met Rompslomp.nl voor API toegang
2. Vraag om API key en endpoint URL
3. Voeg de gegevens toe aan je `.env.local`

## 📊 Test Data

Na het runnen van `npm run db:seed` zijn de volgende test accounts beschikbaar:

- **Admin**: admin@maas-platform.nl
- **Customer**: customer@example.com  
- **Employee**: employee@maas-platform.nl

## 🧪 Testen

Ga naar `http://localhost:3000/test` om de platform status te controleren.

## 📁 Project Structuur

```
maas-platform/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard
│   │   ├── dashboard/          # Customer dashboard
│   │   ├── api/               # API routes
│   │   ├── test/              # Test page
│   │   └── page.tsx           # Landing page
│   ├── components/ui/         # UI componenten
│   └── lib/                   # Utilities & services
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
└── README.md                 # Volledige documentatie
```

## 🚀 Deployment

### Vercel (Aanbevolen)

1. Push code naar GitHub
2. Verbind repository met Vercel
3. Configureer environment variabelen in Vercel dashboard
4. Deploy automatisch

### Database Hosting

- **Railway**: PostgreSQL hosting
- **Supabase**: Database en auth
- **PlanetScale**: MySQL hosting

## 🔍 Troubleshooting

### Prisma Errors
```bash
# Reset database
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### Authentication Issues
- Controleer Clerk keys in `.env.local`
- Zorg dat de redirect URLs correct zijn geconfigureerd

## 📞 Support

Voor vragen of problemen:
- Email: info@maas-platform.nl
- GitHub Issues: Voor technische problemen
- Documentatie: Zie README.md voor volledige details 