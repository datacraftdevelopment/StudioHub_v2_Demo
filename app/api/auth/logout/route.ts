import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Clear session cookies
  cookies().delete('fm-session')
  cookies().delete('fm-user')

  // Redirect to login page
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}