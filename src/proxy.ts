import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function hasUserToken(request: NextRequest) {
  return Boolean(
    request.cookies.get('stackread_user_access_token')?.value ||
    request.cookies.get('user_access_token')?.value,
  )
}

function hasStaffToken(request: NextRequest) {
  return Boolean(
    request.cookies.get('stackread_staff_access_token')?.value ||
    request.cookies.get('staff_access_token')?.value,
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAuthenticated = hasUserToken(request)
  const staffAuthenticated = hasStaffToken(request)

  if (pathname.startsWith('/dashboard') && !userAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login' &&
    pathname !== '/admin/2fa' &&
    !staffAuthenticated
  ) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (
    userAuthenticated &&
    pathname.startsWith('/auth/') &&
    pathname !== '/auth/callback' &&
    pathname !== '/auth/check-email'
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (userAuthenticated && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (staffAuthenticated && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/auth/register', request.url))
  }

  if (pathname === '/verify-email') {
    return NextResponse.redirect(new URL('/auth/verify-email', request.url))
  }

  if (pathname === '/forgot-password') {
    return NextResponse.redirect(new URL('/auth/forgot-password', request.url))
  }

  if (pathname === '/check-email') {
    return NextResponse.redirect(new URL('/auth/check-email', request.url))
  }

  if (pathname === '/reset-password') {
    return NextResponse.redirect(new URL('/auth/reset-password', request.url))
  }

  if (pathname === '/callback') {
    return NextResponse.redirect(new URL('/auth/callback', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/auth/login',
    '/auth/register',
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/check-email',
    '/reset-password',
    '/callback',
  ],
}
