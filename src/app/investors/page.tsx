import Image from 'next/image';
import { notFound } from 'next/navigation';
import { User, FileText, Users, LayoutDashboard, Banknote, Table } from 'lucide-react';
import { InvestorsNav } from './investors-nav';

type CLevelRole = {
  title: string;
  name?: string;
  expertise: string;
  image: string | null;
  vacancy?: boolean;
  external?: boolean;
  department: string;
  departmentStatus: 'In house' | 'External';
};

const C_LEVEL: CLevelRole[] = [
  {
    title: 'CCO',
    name: 'Raymond',
    expertise: 'Commercial growth & partnerships',
    image: '/profile_pics/raymond_linkedin.jpeg',
    department: 'Corporate Sales',
    departmentStatus: 'In house',
  },
  {
    title: 'CTO / CPO',
    expertise: 'Tech & product leadership',
    image: null,
    vacancy: true,
    department: 'Product',
    departmentStatus: 'In house',
  },
  {
    title: 'COO',
    name: 'Maeglin',
    expertise: 'Growth execution & operational scaling',
    image: '/profile_pics/maeglin_linkedin.jpeg',
    department: 'Operations',
    departmentStatus: 'In house',
  },
  {
    title: 'CFO / Legal',
    expertise: 'Financial governance & reporting',
    image: null,
    external: true,
    department: 'Finance',
    departmentStatus: 'External',
  },
  {
    title: 'CMO',
    name: 'Mitchell',
    expertise: 'Brand, performance & demand generation',
    image: '/profile_pics/mitchell_linkedin.jpeg',
    department: 'Marketing',
    departmentStatus: 'In house',
  },
  {
    title: 'CSO',
    name: 'Mark',
    expertise: 'Strategy, M&A & investor relations',
    image: '/profile_pics/mark_linkedin.jpeg',
    department: 'Strategy, investment & content',
    departmentStatus: 'In house',
  },
];

function CLevelBlock({ role }: { role: CLevelRole }) {
  const isVacancy = role.vacancy ?? false;
  const isExternal = role.external ?? false;
  const bg =
    isVacancy || isExternal
      ? 'bg-amber-100 border-amber-200'
      : 'bg-emerald-50 border-emerald-200';

  return (
    <div
      className={`flex min-h-full min-w-0 flex-col rounded-lg border-2 p-4 text-center ${bg}`}
    >
      <div className="aspect-square w-full max-w-[120px] mx-auto overflow-hidden rounded-lg bg-white/80">
        {role.image ? (
          <Image
            src={role.image}
            alt={role.name ?? role.title}
            width={120}
            height={120}
            className="h-full w-full object-cover"
            sizes="120px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <User className="h-8 w-8" strokeWidth={1.25} />
            {role.vacancy && (
              <span className="mt-1 text-xs font-medium text-gray-500">vacancy</span>
            )}
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-900">
        {role.title}
        {role.name && ` (${role.name})`}
        {role.vacancy && ' (vacancy)'}
        {role.external && ' (vacancy)'}
      </p>
      <p className="mt-0.5 text-xs text-gray-600">{role.expertise}</p>
    </div>
  );
}

function DepartmentBlock({
  label,
  status,
}: {
  label: string;
  status: 'In house' | 'External';
}) {
  const isExternal = status === 'External';
  const bg = isExternal ? 'bg-amber-100 border-amber-200' : 'bg-emerald-50 border-emerald-200';

  return (
    <div
      className={`flex flex-1 min-w-0 flex-col items-center justify-center rounded-lg border-2 p-3 text-center ${bg}`}
    >
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-600">({status})</p>
    </div>
  );
}

const MENU_ITEMS = [
  { id: 'intro', label: 'Introduction', icon: LayoutDashboard },
  { id: 'pitchdeck', label: 'Pitch deck', icon: FileText },
  { id: 'finance', label: 'Finance', icon: Banknote },
  { id: 'captable', label: 'Cap table', icon: Table },
  { id: 'team', label: 'Leadership Team', icon: Users },
] as const;

const FINANCE_PDFS = [
  { label: 'Investment Cashflow 2026', path: '/pitchdeck/Investment Cashflow - 2026.pdf' },
  { label: 'Investment Cashflow 2027', path: '/pitchdeck/Investment Cashflow - 2027.pdf' },
  { label: 'Investment Cashflow 2028', path: '/pitchdeck/Investment Cashflow - 2028.pdf' },
] as const;

const CAP_TABLE_PDF = '/pitchdeck/P&L The Fit Network - cap table (April 2026).pdf';

export default async function InvestorsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const params = await searchParams;
  const token = process.env.INVESTOR_ACCESS_TOKEN;
  const key = params.key;

  if (!token || typeof key !== 'string' || key !== token) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo_fitchannel.png"
                alt="Fitchannel"
                width={220}
                height={70}
                className="h-14 w-auto object-contain"
              />
              <span className="text-sm text-gray-500">Investor overview</span>
            </div>
            <InvestorsNav items={MENU_ITEMS} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sectie: Introduction – landingssectie */}
        <section id="intro" className="scroll-mt-24 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-gray-600" />
            Introduction
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5 text-gray-700">
            <p>
              Fitchannel.com is the leading online platform for health and vitality in the Netherlands and Belgium, now ready for international expansion (including Germany and the Nordics), offering a holistic approach to fitness, nutrition and mental health (Body, Food & Mind).
            </p>
            <p>
              Our proven, scalable business model has been EBITDA-positive since 2020. Revenue in 2024 exceeded €1 million with €450k ARR. For 2025 we project €1.3 million revenue with ARR growth. Fitchannel combines low customer acquisition costs with high customer value thanks to a validated product–market fit and minimum three-year contracts within our B2B2C proposition.
            </p>
            <p>
              Our team includes Olympic champion Mark Tuitert alongside seasoned experts from the tech, media and sports sectors. Our product–market fit is validated by major insurers and corporate partners.
            </p>
            <p>
              Fitchannel operates in the rapidly growing B2B2C market with a pipeline of over 150,000 potential users.
            </p>
            <p>
              We are raising €2.5 million in growth capital to scale internationally, of which €500k–€700k is already committed. With this round we will scale internationally with strategic partners and grow towards one million users. In return, we are offering a 20% equity stake for a €2 million investment.
            </p>
          </div>
        </section>

        {/* Sectie: Pitch deck */}
        <section id="pitchdeck" className="scroll-mt-24 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            Pitch deck 2026
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <iframe
              src="/pitchdeck/deck_2026_EN_V3.pdf"
              title="Pitch deck 2026"
              className="w-full h-[75vh] min-h-[500px]"
            />
            <p className="text-xs text-gray-500 px-4 py-2 border-t border-gray-100">
              deck_2026_EN_V3.pdf — Use the PDF controls to zoom or download if needed.
            </p>
          </div>
        </section>

        {/* Sectie: Finance */}
        <section id="finance" className="scroll-mt-24 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-gray-600" />
            Finance
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Investment cashflow per jaar.
          </p>
          <div className="space-y-8">
            {FINANCE_PDFS.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                <p className="text-sm font-medium text-gray-700 px-4 py-2 border-b border-gray-100 bg-gray-50">
                  {item.label}
                </p>
                <iframe
                  src={encodeURI(item.path)}
                  title={item.label}
                  className="w-full h-[60vh] min-h-[400px]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Sectie: Cap table */}
        <section id="captable" className="scroll-mt-24 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Table className="h-5 w-5 text-gray-600" />
            Cap table
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            P&L The Fit Network – cap table (April 2026).
          </p>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <iframe
              src={encodeURI(CAP_TABLE_PDF)}
              title="Cap table April 2026"
              className="w-full h-[75vh] min-h-[500px]"
            />
          </div>
        </section>

        {/* Sectie: Leadership Team */}
        <section id="team" className="scroll-mt-24 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            Leadership Team & Governance Structure
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Executive team driving vision, strategy and execution.
          </p>

          <div className="space-y-6">
            {/* CEO */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 text-center max-w-xs w-full">
                <div className="aspect-square w-full max-w-[100px] overflow-hidden rounded-lg bg-white/80">
                  <Image
                    src="/profile_pics/yuri_linkedin.jpeg"
                    alt="Yuri"
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                    sizes="100px"
                  />
                </div>
                <p className="mt-3 font-semibold text-gray-900">CEO (Yuri)</p>
                <p className="text-xs text-gray-600">Vision, strategy & capital markets</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {C_LEVEL.map((role) => (
                <div key={role.title + (role.name ?? '')}>
                  <CLevelBlock role={role} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {C_LEVEL.map((role) => (
                <div key={role.department}>
                  <DepartmentBlock label={role.department} status={role.departmentStatus} />
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500">
              Governance supported by external legal & financial advisors.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
