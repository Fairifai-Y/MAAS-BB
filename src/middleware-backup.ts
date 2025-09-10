import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // For now, we'll handle email domain validation on the client side
  // This prevents middleware errors while Clerk is being set up
  
  // Only protect admin routes for now
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check if user has a valid session cookie (basic check)
    const sessionToken = request.cookies.get('__session')?.value;
    
    if (!sessionToken) {
      // Redirect to auth page if no session
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Only protect admin routes for now
     */
    '/admin/:path*',
  ],
};
