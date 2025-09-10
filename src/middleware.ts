import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function middleware(request: NextRequest) {
  // Get the current user from Clerk
  const { userId, sessionClaims } = await auth();
  
  // If user is authenticated, check email domain
  if (userId && sessionClaims?.email) {
    const email = sessionClaims.email as string;
    
    // Check if email ends with @fitchannel.com
    if (!email.endsWith('@fitchannel.com')) {
      // Redirect to unauthorized page or show error
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 