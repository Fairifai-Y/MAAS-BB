import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface DeliveredProduct {
  id: string;
  name: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  category: 'WEBSITE' | 'SOCIAL_MEDIA' | 'EMAIL_MARKETING' | 'DESIGN' | 'CONTENT';
  completedAt?: string;
  assignedTo?: string;
  progress?: number;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer actions (delivered products) for the authenticated user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        customers: {
          include: {
            customer_packages: {
              include: {
                activities: {
                  include: {
                    actions: {
                      include: {
                        owner: {
                          include: {
                            users: true
                          }
                        }
                      },
                      orderBy: {
                        createdAt: 'desc'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user?.customers) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Flatten all actions from all customer packages and convert to delivered products format
    const allActions = user.customers.customer_packages.flatMap(cp => 
      cp.activities.flatMap(activity => 
        activity.actions.map(action => ({
          id: action.id,
          name: action.title || action.description,
          description: action.description,
          status: action.status === 'COMPLETED' ? 'COMPLETED' : 
                  action.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING',
          category: getCategoryFromActivity(activity.description),
          completedAt: action.status === 'COMPLETED' ? action.updatedAt?.toISOString() : undefined,
          assignedTo: action.owner.users.name,
          progress: action.status === 'IN_PROGRESS' ? 50 : 
                   action.status === 'COMPLETED' ? 100 : 0
        }))
      )
    );

    return NextResponse.json(allActions);
  } catch (error) {
    console.error('Failed to fetch customer products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Helper function to determine category from activity description
function getCategoryFromActivity(description: string): 'WEBSITE' | 'SOCIAL_MEDIA' | 'EMAIL_MARKETING' | 'DESIGN' | 'CONTENT' {
  const desc = description.toLowerCase();
  
  if (desc.includes('website') || desc.includes('web') || desc.includes('site')) {
    return 'WEBSITE';
  }
  if (desc.includes('linkedin') || desc.includes('instagram') || desc.includes('facebook') || desc.includes('tiktok') || desc.includes('social')) {
    return 'SOCIAL_MEDIA';
  }
  if (desc.includes('nieuwsbrief') || desc.includes('email') || desc.includes('mail')) {
    return 'EMAIL_MARKETING';
  }
  if (desc.includes('seo') || desc.includes('blog') || desc.includes('content') || desc.includes('copywriting')) {
    return 'CONTENT';
  }
  if (desc.includes('design') || desc.includes('logo') || desc.includes('foto') || desc.includes('visual')) {
    return 'DESIGN';
  }
  
  return 'CONTENT'; // Default category
} 