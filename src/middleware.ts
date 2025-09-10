import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // All routes are protected except these public routes
  publicRoutes: [
    '/',
    '/auth',
    '/unauthorized',
    '/api/health'
  ],
  
  // Custom logic for email domain validation
  beforeAuth: (auth, req) => {
    // This runs before authentication
  },
  
  afterAuth: (auth, req) => {
    // This runs after authentication
    const { userId, sessionClaims } = auth();
    
    // If user is authenticated, check email domain
    if (userId && sessionClaims?.email) {
      const email = sessionClaims.email as string;
      
      // Check if email ends with @fitchannel.com
      if (!email.endsWith('@fitchannel.com')) {
        // Redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
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