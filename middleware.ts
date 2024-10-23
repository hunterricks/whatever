import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                         request.nextUrl.pathname.startsWith('/profile') ||
                         request.nextUrl.pathname.startsWith('/post-job') ||
                         request.nextUrl.pathname.startsWith('/browse-jobs') ||
                         request.nextUrl.pathname.startsWith('/my-jobs') ||
                         request.nextUrl.pathname.startsWith('/my-proposals') ||
                         request.nextUrl.pathname.startsWith('/messages');

  // If trying to access auth pages while logged in, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard/homeowner', request.url));
  }

  // If trying to access protected pages without token, redirect to login
  if (!token && isProtectedPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Verify JWT for API routes
  if (request.nextUrl.pathname.startsWith('/api') && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user', JSON.stringify(decoded));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (_error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/post-job/:path*',
    '/browse-jobs/:path*',
    '/my-jobs/:path*',
    '/my-proposals/:path*',
    '/messages/:path*',
    '/login',
    '/signup',
  ],
};
