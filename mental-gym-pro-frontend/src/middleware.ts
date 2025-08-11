// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/exercises', '/profile', '/challenges']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Si tienes token en cookie, redirige fuera de /login y /register
  if (authRoutes.includes(request.nextUrl.pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ⚠️ Opcional: desactiva este bloque mientras uses localStorage
  // if (protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r)) && !token) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return NextResponse.next()
}
