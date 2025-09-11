import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email verification endpoint called');
    
    // Get the request body
    const body = await request.json().catch(() => ({}));
    console.log('📧 Request body:', body);
    
    // Clerk expects a simple success response for email verification
    return NextResponse.json({ 
      success: true,
      verified: true
    });
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
