import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email verification endpoint called at /auth/verify-email-address');
    
    // This endpoint exists to handle Clerk's email verification requests
    // Clerk handles the actual verification logic, we just need to respond appropriately
    return NextResponse.json({ 
      message: 'Email verification endpoint reached',
      success: true 
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
