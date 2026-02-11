import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/employee/reports/hours-by-customer?month=11&year=2025
 * Returns monthly overview of worked hours per customer for the logged-in employee
 * and colleagues (so the user can justify work to the client, e.g. via screenshot).
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const employee = await prisma.employees.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const now = new Date();
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam, 10) - 1 : now.getMonth(); // 0-indexed

    if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      );
    }

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 1);

    // Customers this employee is linked to (has at least one activity)
    const myPackageIds = await prisma.activity
      .findMany({
        where: { employeeId: employee.id },
        select: { customerPackageId: true },
        distinct: ['customerPackageId'],
      })
      .then((rows) => rows.map((r) => r.customerPackageId));

    if (myPackageIds.length === 0) {
      return NextResponse.json({
        month: month + 1,
        year,
        byCustomer: [],
      });
    }

    // All activities in this month for those customer packages (all employees)
    const activities = await prisma.activity.findMany({
      where: {
        customerPackageId: { in: myPackageIds },
        date: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      include: {
        customer_packages: {
          include: {
            customers: {
              include: {
                users: { select: { name: true, email: true } },
              },
            },
          },
        },
        employees: {
          include: {
            users: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });

    // Aggregate by customer, then by employee
    type EmpEntry = { employeeId: string; name: string; hours: number };
    const byCustomerMap = new Map<
      string,
      { customerId: string; company: string; employees: Map<string, EmpEntry>; totalHours: number }
    >();

    for (const a of activities) {
      const cust = a.customer_packages.customers;
      const custId = cust.id;
      const company = cust.company || cust.users?.email || 'Onbekend';

      if (!byCustomerMap.has(custId)) {
        byCustomerMap.set(custId, {
          customerId: custId,
          company,
          employees: new Map(),
          totalHours: 0,
        });
      }

      const entry = byCustomerMap.get(custId)!;
      const hours = Number(a.hours) || 0;
      const empId = a.employees.id;
      const name = a.employees.users?.name || a.employees.users?.email || 'Onbekend';

      if (!entry.employees.has(empId)) {
        entry.employees.set(empId, { employeeId: empId, name, hours: 0 });
      }
      entry.employees.get(empId)!.hours += hours;
      entry.totalHours += hours;
    }

    const byCustomer = Array.from(byCustomerMap.values()).map((entry) => ({
      customerId: entry.customerId,
      company: entry.company,
      employees: Array.from(entry.employees.values()).sort((a, b) => b.hours - a.hours),
      totalHours: Math.round(entry.totalHours * 100) / 100,
    }));

    return NextResponse.json({
      month: month + 1,
      year,
      byCustomer: byCustomer.sort((a, b) => b.totalHours - a.totalHours),
    });
  } catch (error) {
    console.error('Failed to fetch hours by customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
