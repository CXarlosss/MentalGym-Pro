// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/exercises', '/profile', '/challenges']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Redirigir usuarios autenticados lejos de las rutas de auth
  if (authRoutes.includes(request.nextUrl.pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirigir usuarios no autenticados al login
  if (
    protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    ) && 
    !token
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}