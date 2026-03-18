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
    ['/auth/login', '/auth/register', '/login', '/register'].includes(pathname)
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (staffAuthenticated && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
    '/login',
    '/register',
  ],
}
