import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email verification endpoint called');
    
    // Get the request body
    const body = await request.json().catch(() => ({}));
    console.log('📧 Request body:', body);
    
    // Clerk expects a specific response format for email verification
    // Return a 200 OK response with empty JSON body as Clerk expects
    return new Response('{}', { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return new Response('{}', { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET() {
  return new Response('{}', { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
