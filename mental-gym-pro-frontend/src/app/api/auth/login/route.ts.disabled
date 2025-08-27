import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (email === 'test@example.com' && password === '123456') {
    return NextResponse.json({
      user: {
        id: '1',
        name: 'Test User',
        email,
        avatar: 'https://i.pravatar.cc/150?u=1'
      },
      token: 'fake-jwt-token'
    })
  }

  return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 })
}
