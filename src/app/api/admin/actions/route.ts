import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exportFormat = searchParams.get('export');

    const actions = await prisma.action.findMany({
      include: {
        activity: {
          include: {
            customer_packages: {
              include: {
                customers: {
                  include: {
                    users: true
                  }
                }
              }
            }
          }
        },
        owner: {
          include: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If export is requested, return CSV format
    if (exportFormat === 'csv') {
      const csvHeaders = [
        'ID',
        'Titel',
        'Beschrijving',
        'Geplande Uren',
        'Werkelijke Uren',
        'Status',
        'Deadline',
        'Voltooid Op',
        'Aangemaakt Op',
        'Bijgewerkt Op',
        'Medewerker Naam',
        'Medewerker Email',
        'Klant Bedrijf',
        'Klant Naam',
        'Klant Email',
        'Activiteit Beschrijving'
      ];

      const csvRows = actions.map(action => [
        action.id,
        action.title,
        action.description || '',
        action.plannedHours,
        action.actualHours || '',
        action.status,
        action.dueDate ? new Date(action.dueDate).toLocaleDateString('nl-NL') : '',
        action.completedAt ? new Date(action.completedAt).toLocaleDateString('nl-NL') : '',
        new Date(action.createdAt).toLocaleDateString('nl-NL'),
        new Date(action.updatedAt).toLocaleDateString('nl-NL'),
        action.owner.users.name,
        action.owner.users.email,
        action.activity.customer_packages.customers.company,
        action.activity.customer_packages.customers.users.name,
        action.activity.customer_packages.customers.users.email,
        action.activity.description
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="acties-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Failed to fetch actions:', error);
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      packageActivityId,
      activityId, // Keep for backward compatibility
      ownerId,
      title,
      description,
      plannedHours,
      actualHours,
      status,
      dueDate
    } = body;

    // Validate required fields
    if ((!packageActivityId && !activityId) || !ownerId || !title || !plannedHours) {
      return NextResponse.json(
        { error: 'Missing required fields: packageActivityId (or activityId), ownerId, title, plannedHours' },
        { status: 400 }
      );
    }

    let activityIdToUse = activityId;

    // If packageActivityId is provided, we need to create an Activity first
    if (packageActivityId) {
      // Get package activity details
      const packageActivity = await prisma.packageActivity.findUnique({
        where: { id: packageActivityId },
        include: {
          package: true,
          activityTemplate: true
        }
      });

      if (!packageActivity) {
        return NextResponse.json(
          { error: 'Package activity not found' },
          { status: 404 }
        );
      }

      // Find the customer package for this package
      const customerPackage = await prisma.customer_packages.findFirst({
        where: { packageId: packageActivity.packageId }
      });

      if (!customerPackage) {
        return NextResponse.json(
          { error: 'No customer package found for this package activity' },
          { status: 404 }
        );
      }

      // Create a new Activity record
      const newActivity = await prisma.activity.create({
        data: {
          customerPackageId: customerPackage.id,
          employeeId: ownerId, // Use the owner as the employee
          description: title,
          hours: Number(plannedHours),
          date: new Date(),
          status: 'PENDING'
        }
      });

      activityIdToUse = newActivity.id;
    }

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityIdToUse }
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if owner exists
    const owner = await prisma.employees.findUnique({
      where: { id: ownerId }
    });

    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    const action = await prisma.action.create({
      data: {
        activityId: activityIdToUse,
        ownerId,
        title,
        description: description || null,
        plannedHours: Number(plannedHours),
        actualHours: actualHours ? Number(actualHours) : null,
        status: status || 'PLANNED',
        // Default deadline to today if not provided
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        updatedAt: new Date()
      },
      include: {
        activity: {
          include: {
            customer_packages: {
              include: {
                customers: {
                  include: {
                    users: true
                  }
                }
              }
            }
          }
        },
        owner: {
          include: {
            users: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Action created successfully', 
      action 
    });
  } catch (error: any) {
    console.error('Failed to create action:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Action already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create action', details: error.message },
      { status: 500 }
    );
  }
}
