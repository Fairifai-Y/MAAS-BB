import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Clerk endpoint called');
    
    // Log all headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log('📋 Headers:', headers);
    
    // Log request body
    const body = await request.json().catch(() => ({}));
    console.log('📦 Body:', body);
    
    // Return a simple response
    return NextResponse.json({ 
      success: true,
      message: 'Test endpoint reached',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test endpoint failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test endpoint is working' });
}
