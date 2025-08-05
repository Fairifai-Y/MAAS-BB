import { NextRequest, NextResponse } from 'next/server';

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
    // For now, return sample data since authentication is not set up
    // TODO: Add proper authentication and database fetching
    const sampleProducts: DeliveredProduct[] = [
      {
        id: '1',
        name: 'Website Homepage',
        description: 'Moderne homepage met responsive design en SEO optimalisatie',
        status: 'COMPLETED',
        category: 'WEBSITE',
        completedAt: '2024-01-15T10:00:00Z',
        assignedTo: 'Jan Jansen'
      },
      {
        id: '2',
        name: 'Social Media Content',
        description: 'Maandelijkse content voor Instagram en LinkedIn',
        status: 'IN_PROGRESS',
        category: 'SOCIAL_MEDIA',
        assignedTo: 'Piet Pietersen',
        progress: 75
      },
      {
        id: '3',
        name: 'Email Newsletter',
        description: 'Kwartaalnieuwsbrief voor klanten met automatisering',
        status: 'PENDING',
        category: 'EMAIL_MARKETING',
        assignedTo: 'Marie de Vries'
      },
      {
        id: '4',
        name: 'Logo Design',
        description: 'Nieuw logo en huisstijl met brand guidelines',
        status: 'COMPLETED',
        category: 'DESIGN',
        completedAt: '2024-01-10T14:30:00Z',
        assignedTo: 'Jan Jansen'
      },
      {
        id: '5',
        name: 'Blog Content',
        description: '4 blog artikelen per maand met SEO optimalisatie',
        status: 'IN_PROGRESS',
        category: 'CONTENT',
        assignedTo: 'Piet Pietersen',
        progress: 60
      },
      {
        id: '6',
        name: 'Google Ads Campagne',
        description: 'Search en Display campagnes voor lead generatie',
        status: 'COMPLETED',
        category: 'SOCIAL_MEDIA',
        completedAt: '2024-01-08T09:15:00Z',
        assignedTo: 'Marie de Vries'
      },
      {
        id: '7',
        name: 'Product Fotografie',
        description: 'Professionele productfoto\'s voor webshop',
        status: 'PENDING',
        category: 'DESIGN',
        assignedTo: 'Jan Jansen'
      },
      {
        id: '8',
        name: 'Landing Page',
        description: 'Conversie-geoptimaliseerde landing page',
        status: 'IN_PROGRESS',
        category: 'WEBSITE',
        assignedTo: 'Piet Pietersen',
        progress: 40
      }
    ];

    return NextResponse.json(sampleProducts);
  } catch (error) {
    console.error('Failed to fetch customer products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 