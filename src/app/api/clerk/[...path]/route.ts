import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    console.log(`🔔 Clerk catch-all endpoint called: ${pathname}`);
    
    // Get the request body
    const body = await request.json().catch(() => ({}));
    console.log('📦 Request body:', body);
    
    // Return a simple success response for any Clerk endpoint
    return NextResponse.json({ 
      success: true,
      message: 'Clerk endpoint reached',
      path: pathname
    });
  } catch (error) {
    console.error('❌ Clerk catch-all error:', error);
    return NextResponse.json(
      { error: 'Clerk endpoint failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  console.log(`🔔 Clerk GET catch-all endpoint called: ${pathname}`);
  
  return NextResponse.json({ 
    message: 'Clerk GET endpoint reached',
    path: pathname
  });
}
