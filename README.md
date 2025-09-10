# Fitchannel Platform - Change the Channel

Een professioneel platform voor het beheren van IT-services met flexibele pakketten, uren tracking en externe integraties.

## 🚀 Functionaliteiten

### Voor Klanten
- **Dashboard**: Overzicht van actieve pakketten en gebruikte uren
- **Pakket Beheer**: Inzicht in Fitchannel pakketten (XS, S, M, L, XL, XXL)
- **Activiteiten Tracking**: Real-time overzicht van afgeronde acties
- **Betalingen**: Geïntegreerde Stripe/Buckaroo betalingen

### Voor Admins
- **Admin Dashboard**: Statistieken en overzicht van alle klanten
- **Pakket Beheer**: Aanmaken en beheren van Fitchannel pakketten
- **Werknemer Beheer**: Uren registratie en activiteiten tracking
- **Rapportages**: Uitgebreide statistieken en analyses

### Integraties
- **Rompslomp.nl**: API koppeling voor project management
- **Stripe**: Recurring betalingen en facturering
- **Buckaroo**: Alternatieve betalingsmethode
- **Clerk**: Authenticatie en gebruikersbeheer

## 🛠️ Technische Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL met Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe & Buckaroo
- **External APIs**: Rompslomp.nl
- **State Management**: Zustand
- **Charts**: Chart.js & React-Chartjs-2

## 📦 Installatie

### 1. Clone de repository
```bash
git clone <repository-url>
cd fitchannel-platform
```

### 2. Installeer dependencies
```bash
npm install
```

### 3. Configureer environment variabelen
Kopieer `env.example` naar `.env.local` en vul de benodigde waarden in:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fitchannel_db"

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

### 4. Database setup
```bash
# Genereer Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optioneel) Seed de database met initiële data
npx prisma db seed
```

### 5. Start de development server
```bash
npm run dev
```

De applicatie is nu beschikbaar op `http://localhost:3000`

## 🗄️ Database Schema

### Hoofdmodellen

#### Users & Roles
- **User**: Basis gebruikersinformatie met Clerk integratie
- **Customer**: Klant-specifieke informatie
- **Employee**: Werknemer informatie met uurtarief
- **Admin**: Admin gebruikers met permissions

#### Packages & Billing
- **Package**: Fitchannel pakketten (XS-XXL) met prijzen en urenlimieten
- **CustomerPackage**: Klant-specifieke pakket abonnementen
- **Invoice**: Facturen en betalingen

#### Activities & Tracking
- **Activity**: Werknemer activiteiten met urenregistratie
- **Rompslomp Integration**: Externe task tracking

## 🔐 Authenticatie & Rollen

### Gebruikersrollen
1. **Customer**: Klanten die Fitchannel pakketten gebruiken
2. **Employee**: Werknemers die uren registreren
3. **Admin**: Beheerders met volledige toegang

### Toegangscontrole
- Middleware beschermt routes op basis van gebruikersrol
- API routes valideren permissions
- Clerk zorgt voor veilige authenticatie

## 💳 Betalingen

### Stripe Integratie
- Recurring subscriptions voor Fitchannel pakketten
- Automatische facturering
- Webhook handling voor betalingsupdates

### Buckaroo Integratie
- Alternatieve betalingsmethode
- iDEAL, creditcard en andere Nederlandse betalingsmethoden

## 🔌 API Integraties

### Rompslomp.nl
```typescript
// Voorbeeld gebruik
import { RompslompService } from '@/lib/rompslomp';

// Task aanmaken
const task = await RompslompService.createTask({
  title: 'Website onderhoud',
  description: 'Regelmatig onderhoud van klant website',
  priority: 'medium'
});
```

### Externe APIs
- **Rompslomp.nl**: Project management en task tracking
- **Stripe**: Betalingen en subscriptions
- **Buckaroo**: Nederlandse betalingsmethoden

## 📊 Dashboard Features

### Admin Dashboard
- Totaal aantal klanten en actieve abonnementen
- Omzet overzicht en trends
- Pakket gebruik statistieken
- Werknemer activiteiten overzicht

### Klant Dashboard
- Actieve pakketten en urengebruik
- Recente activiteiten en status
- Betalingsgeschiedenis
- Pakket voortgang en limieten

## 🚀 Deployment

### Vercel (Aanbevolen)
1. Push code naar GitHub
2. Verbind repository met Vercel
3. Configureer environment variabelen
4. Deploy automatisch

### Andere Platforms
- **Railway**: PostgreSQL hosting
- **Supabase**: Database en auth
- **Netlify**: Static hosting (met API routes)

## 🔧 Development

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

### Database Commands
```bash
npx prisma studio    # Database GUI
npx prisma generate  # Genereer client
npx prisma db push   # Push schema changes
npx prisma migrate   # Run migrations
```

## 📝 API Routes

### Packages
- `GET /api/packages` - Alle pakketten ophalen
- `POST /api/packages` - Nieuw pakket aanmaken (Admin)

### Activities
- `GET /api/activities` - Activiteiten ophalen
- `POST /api/activities` - Nieuwe activiteit registreren

### Customer
- `GET /api/customer/packages` - Klant pakketten
- `GET /api/customer/activities` - Klant activiteiten

### Admin
- `GET /api/admin/stats` - Dashboard statistieken

### Stripe
- `POST /api/stripe/webhook` - Webhook handler

## 🤝 Bijdragen

1. Fork de repository
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License.

## 🆘 Support

Voor vragen of problemen:
- Email: info@fitchannel.com
- Telefoon: +31 (0)20 123 4567
- GitHub Issues: Voor technische problemen

---

**Fitchannel Platform** - Change the Channel
