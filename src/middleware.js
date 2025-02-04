import { NextResponse } from 'next/server'

export function middleware(request) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/Login' || path === '/signin'

  const token = request.cookies.get('token')?.value || ''

  // Redirect to home if the user is logged in and tries to access login/signin
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  // Redirect to login if the user is not logged in and tries to access protected routes
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/Login', request.nextUrl))
  }
    
  return NextResponse.next() // Proceed to the requested page if the conditions are met
}

export const config = {
  matcher: [
    '/', // Home page
    '/profile', // Profile page
    '/friends', // Friends page
    '/Login', // Login page
    '/signin', // Signin page
  ]
}
