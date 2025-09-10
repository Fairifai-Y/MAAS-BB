import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function middleware(request: NextRequest) {
  try {
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
  } catch (error) {
    // If there's an error with Clerk auth, log it and continue
    console.error('Middleware auth error:', error);
    
    // For now, allow the request to continue
    // This prevents the middleware from breaking the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Temporarily disable middleware to prevent 500 errors
     * We'll use client-side EmailDomainGuard instead
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|auth|unauthorized).*)',
  ],
}; 