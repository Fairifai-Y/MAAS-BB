import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    console.log(`🔔 Auth catch-all endpoint called: ${pathname}`);
    
    // Get the request body
    const body = await request.json().catch(() => ({}));
    console.log('📦 Request body:', body);
    
    // Return a simple success response for any auth endpoint
    return NextResponse.json({ 
      success: true,
      message: 'Auth endpoint reached',
      path: pathname
    });
  } catch (error) {
    console.error('❌ Auth catch-all error:', error);
    return NextResponse.json(
      { error: 'Auth endpoint failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  console.log(`🔔 Auth GET catch-all endpoint called: ${pathname}`);
  
  return NextResponse.json({ 
    message: 'Auth GET endpoint reached',
    path: pathname
  });
}
