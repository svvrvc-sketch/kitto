import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const userIdCookie = request.cookies.get('kitto_user_id')?.value;
    const userRoleCookie = request.cookies.get('kitto_user_role')?.value;

    // Check if user is logged in
    if (!userIdCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-Based Access Control: Only 'admin' role allowed
    if (userRoleCookie !== 'admin') {
      // Forbidden: redirect to home with security notice
      const forbiddenUrl = new URL('/', request.url);
      forbiddenUrl.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
