import { NextResponse } from 'next/server';

/**
 * Middleware for password protection.
 * Checks if user has valid session cookie.
 * Redirects to /login if not authenticated.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow access to login page and auth API without authentication
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Check for valid session cookie
  const sessionToken = request.cookies.get('session_token');
  
  if (!sessionToken) {
    // No session - redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Session exists - allow request to proceed
  return NextResponse.next();
}

// Configure which paths the middleware runs on
// Matches all paths except static files and Next.js internals
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public files (like icons, images)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
