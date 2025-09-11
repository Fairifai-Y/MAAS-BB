import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    console.log(`🔔 Clerk catch-all endpoint called: ${pathname}`);
    
    // Get the request body
    const body = await request.json().catch(() => ({}));
    console.log('📦 Request body:', body);
    
    // Return a simple success response for any Clerk endpoint
    return new Response('{}', { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ Clerk catch-all error:', error);
    return new Response('{}', { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  console.log(`🔔 Clerk GET catch-all endpoint called: ${pathname}`);
  
  return new Response('{}', { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
