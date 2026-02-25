'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Building2, Users, Clock, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomerLayout from '@/components/customer-layout';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

interface EmployeeHours {
  employeeId: string;
  name: string;
  hours: number;
}

interface ActivityDetail {
  id: string;
  date: string;
  description: string;
  hours: number;
  employeeId: string;
  employeeName: string;
}

interface CustomerHours {
  customerId: string;
  company: string;
  employees: EmployeeHours[];
  activities: ActivityDetail[];
  totalHours: number;
}

interface HoursByCustomerResponse {
  month: number;
  year: number;
  byCustomer: CustomerHours[];
}

export default function UrenPerKlantPage() {
  const [data, setData] = useState<HoursByCustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerHours | null>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/employee/reports/hours-by-customer?month=${month}&year=${year}`)
      .then((res) => {
        if (!res.ok) throw new Error('Rapport laden mislukt');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <CustomerLayout
      title="Maandoverzicht per klant"
      description="Gewerkte uren per klant per maand – voor jezelf en collega’s. Geschikt om naar de klant te verantwoorden (bijv. screenshot)."
    >
      {/* Maand/jaar selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700">Periode</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
                aria-label="Vorige maand"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[180px] text-center text-lg font-semibold text-gray-900">
                {monthLabel}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                aria-label="Volgende maand"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Overzicht laden...</span>
        </div>
      )}

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-amber-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && data && (
        <>
          {data.byCustomer.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Geen uren in deze maand</h3>
                <p className="mt-1 text-gray-500">
                  Er zijn geen gewerkte uren gevonden voor {monthLabel} voor jouw klanten.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {data.byCustomer.map((cust) => (
                <Card key={cust.customerId} className="overflow-hidden print:break-inside-avoid">
                  <CardHeader className="bg-gray-50 pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      {cust.company}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {monthLabel} · Totaal {cust.totalHours.toFixed(1)} uur
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="mb-4">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-200 text-sm text-gray-500">
                            <th className="pb-2 font-medium">Medewerker</th>
                            <th className="pb-2 text-right font-medium">Uren</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cust.employees.map((emp) => (
                            <tr key={emp.employeeId} className="border-b border-gray-100">
                              <td className="py-2">
                                <span className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  {emp.name}
                                </span>
                              </td>
                              <td className="py-2 text-right font-medium">
                                <span className="flex items-center justify-end gap-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  {emp.hours.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-200 font-medium text-gray-900">
                            <td className="pt-2">Totaal</td>
                            <td className="pt-2 text-right">{cust.totalHours.toFixed(1)} uur</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    {cust.activities && cust.activities.length > 0 && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(cust)}
                        >
                          Bekijk specificatie
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Je ziet alleen klanten waarvoor jij werkzaamheden hebt. Per klant worden jouw uren en
            die van collega’s getoond, zodat je dit overzicht naar de klant kunt verantwoorden
            (bijv. via een screenshot).
          </p>

          {/* Details dialoog met specificatie per klant/maand */}
          <Dialog
            open={!!selectedCustomer}
            onOpenChange={(open) => {
              if (!open) setSelectedCustomer(null);
            }}
          >
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              {selectedCustomer && (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      Specificatie uren – {selectedCustomer.company} ({monthLabel})
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-3">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
                          <th className="py-2">Datum</th>
                          <th className="py-2">Medewerker</th>
                          <th className="py-2">Omschrijving</th>
                          <th className="py-2 text-right">Uren</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.activities
                          .slice()
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((act) => (
                            <tr key={act.id} className="border-b border-gray-100 align-top">
                              <td className="py-2 text-xs text-gray-600 whitespace-nowrap">
                                {new Date(act.date).toLocaleDateString('nl-NL')}
                              </td>
                              <td className="py-2 text-xs text-gray-700 whitespace-nowrap">
                                {act.employeeName}
                              </td>
                              <td className="py-2 text-xs text-gray-700">
                                {act.description}
                              </td>
                              <td className="py-2 text-xs text-right text-gray-900 whitespace-nowrap">
                                {act.hours.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200 font-medium text-gray-900 text-xs">
                          <td className="pt-2" colSpan={3}>
                            Totaal
                          </td>
                          <td className="pt-2 text-right">
                            {selectedCustomer.activities
                              .reduce((sum, a) => sum + a.hours, 0)
                              .toFixed(1)}{' '}
                            uur
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </CustomerLayout>
  );
}
