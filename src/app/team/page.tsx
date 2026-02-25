import Image from 'next/image';
import Link from 'next/link';
import DynamicHeader from '@/components/dynamic-header';
import { Button } from '@/components/ui/button';
import { User, Home } from 'lucide-react';

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

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />

      <section className="border-b border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Leadership Team & Governance Structure
          </h1>
          <p className="mt-1 text-gray-600 text-sm">
            Executive team driving vision, strategy and execution.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Tier 1: Board */}
          <div className="w-full rounded-lg border-2 border-amber-200 bg-amber-50/90 px-6 py-4 text-center">
            <p className="text-lg font-bold text-gray-900">BOARD</p>
          </div>

          {/* Tier 2: CEO */}
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

          {/* Tier 3: C-level row – 6 gelijke blokken */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {C_LEVEL.map((role) => (
              <div key={role.title + (role.name ?? '')}>
                <CLevelBlock role={role} />
              </div>
            ))}
          </div>

          {/* Tier 4: Department row – zelfde kolommen */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {C_LEVEL.map((role) => (
              <div key={role.department}>
                <DepartmentBlock label={role.department} status={role.departmentStatus} />
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Governance supported by external legal & financial advisors.
          </p>
        </div>
      </section>
    </div>
  );
}
