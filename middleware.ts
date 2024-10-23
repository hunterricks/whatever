import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  return NextResponse.next();
}