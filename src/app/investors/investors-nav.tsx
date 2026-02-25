import type { LucideIcon } from 'lucide-react';

type NavItem = { id: string; label: string; icon: LucideIcon };

export function InvestorsNav({ items }: { items: readonly NavItem[] }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Investor sections">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-300"
          >
            <Icon className="h-4 w-4 text-gray-500" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
