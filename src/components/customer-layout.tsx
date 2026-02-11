'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  CheckSquare,
  Home,
  LayoutDashboard,
  Settings,
  CalendarDays
} from 'lucide-react';
import Logo from '@/components/ui/logo';
import EmployeeGuard from '@/components/employee-guard';
import { useUserRole } from '@/hooks/use-user-role';

interface CustomerLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const menuItems = [
  {
    name: 'Overzicht',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Dashboard en statistieken'
  },
  {
    name: 'Acties',
    href: '/dashboard/actions',
    icon: CheckSquare,
    description: 'Mijn acties en taken'
  },
  {
    name: 'Maandoverzicht',
    href: '/dashboard/uren-per-klant',
    icon: CalendarDays,
    description: 'Uren per klant per maand'
  }
];

export default function CustomerLayout({ children, title, description }: CustomerLayoutProps) {
  const pathname = usePathname();
  const { isAdmin, isLoadingRole } = useUserRole();

  return (
    <EmployeeGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <div className="flex items-center space-x-3">
              <a href="/">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </a>
              <a href="/dashboard">
                <Button size="sm" className="flex items-center">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </a>
              {/* Admin Button - Only visible for admin users */}
              {!isLoadingRole && isAdmin && (
                <a href="/admin">
                  <Button size="sm" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Mijn Dashboard</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-2">{description}</p>
              )}
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
      </div>
    </EmployeeGuard>
  );
}
