import { NextResponse } from 'next/server';

export async function POST() {
  // Create response that clears the token cookie
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Clear the token cookie with multiple approaches to ensure it works
  response.cookies.set('token', '', {
    path: '/',
    expires: new Date(0),
    httpOnly: false, // Allow client-side access for clearing
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  // Also set an expired cookie with the same name to ensure clearing
  response.cookies.set('token', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}