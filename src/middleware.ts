import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define which routes should be protected
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/test-auth(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    const { protect } = await auth();
    protect();
  }

  // Get the current user from Clerk
  const { userId, sessionClaims } = await auth();
  
  // If user is authenticated, check email domain
  if (userId && sessionClaims?.email) {
    const email = sessionClaims.email as string;
    
    // Check if email ends with @fitchannel.com
    if (!email.endsWith('@fitchannel.com')) {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 