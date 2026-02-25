import Image from 'next/image';
import Link from 'next/link';
import DynamicHeader from '@/components/dynamic-header';
import { Button } from '@/components/ui/button';
import { User, Home } from 'lucide-react';

type TeamMember = {
  name: string;
  title: string;
  expertise: string;
  image: string | null;
  placeholder?: boolean;
};

const TEAM: TeamMember[] = [
  {
    name: 'Yuri',
    title: 'CEO',
    expertise: 'Vision, strategy & capital markets',
    image: '/profile_pics/yuri_linkedin.jpeg',
  },
  {
    name: 'Raymond',
    title: 'CCO',
    expertise: 'Commercial growth & partnerships',
    image: '/profile_pics/raymond_linkedin.jpeg',
  },
  {
    name: 'Mitchell',
    title: 'CMO',
    expertise: 'Brand, performance & demand generation',
    image: '/profile_pics/mitchell_linkedin.jpeg',
  },
  {
    name: 'Mark',
    title: 'CSO',
    expertise: 'Strategy, M&A & investor relations',
    image: '/profile_pics/mark_linkedin.jpeg',
  },
  {
    name: 'Maeglin',
    title: 'COO',
    expertise: 'Growth execution & operational scaling',
    image: '/profile_pics/maeglin_linkedin.jpeg',
  },
  {
    name: 'CTO / CPO',
    title: 'Strategic hire (Q3 2026)',
    expertise: 'Tech & product leadership',
    image: null,
    placeholder: true,
  },
  {
    name: 'CFO',
    title: 'External (Board-level oversight)',
    expertise: 'Financial governance & reporting',
    image: null,
    placeholder: true,
  },
];

function TeamCard({
  name,
  title,
  expertise,
  image,
  placeholder,
}: {
  name: string;
  title: string;
  expertise: string;
  image: string | null;
  placeholder?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            width={320}
            height={320}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <User className="h-16 w-16" strokeWidth={1.25} />
            {placeholder && (
              <span className="mt-2 text-sm font-medium text-gray-500">{title}</span>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="text-sm font-medium text-amber-600">{title}</p>
        <p className="mt-1 text-sm text-gray-600">{expertise}</p>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />

      <section className="border-b border-gray-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Leadership Team & Governance Structure
          </h1>
          <p className="mt-2 text-gray-600">
            Executive team driving vision, strategy and execution.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*:nth-child(5)]:xl:col-start-2">
            {TEAM.map((member) => (
              <TeamCard
                key={member.name}
                name={member.name}
                title={member.title}
                expertise={member.expertise}
                image={member.image}
                placeholder={member.placeholder}
              />
            ))}
          </div>

          <p className="mt-12 text-center text-sm text-gray-500">
            Governance supported by external legal & financial advisors.
          </p>
        </div>
      </section>
    </div>
  );
}
