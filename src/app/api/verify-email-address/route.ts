import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email verification endpoint called');
    
    // Get the request body
    const body = await request.json().catch(() => ({}));
    console.log('📧 Request body:', body);
    
    // Clerk expects a specific response format for email verification
    // Return a simple 200 OK response with success JSON body
    return new Response(JSON.stringify({ 
      success: true
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return new Response(null, { status: 500 });
  }
}

export async function GET() {
  return new Response(null, { status: 405 });
}
