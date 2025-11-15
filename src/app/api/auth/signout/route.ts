import { NextRequest, NextResponse } from 'next/server'
import { signOut } from 'next-auth/react'

export async function POST(request: NextRequest) {
  // This will be handled by NextAuth.js
  return NextResponse.redirect(new URL('/login', request.url))
}