import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { name, email, password } = await request.json()

  return NextResponse.json({
    user: {
      id: '2',
      name,
      email,
      password,
      avatar: 'https://i.pravatar.cc/150?u=2'
    },
    token: 'fake-register-token'
  })
}
