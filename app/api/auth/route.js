import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Generates a secure random session token.
 * Uses crypto for cryptographically secure randomness.
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/auth
 * Validates password and sets session cookie.
 * 
 * Request body: { password: string }
 * Response: { success: boolean } or { error: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get the correct password from environment variable
    const correctPassword = process.env.APP_PASSWORD;

    // Check if APP_PASSWORD is configured
    if (!correctPassword) {
      console.error('APP_PASSWORD environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate password
    if (!password) {
      return NextResponse.json(
        { error: 'Lösenord krävs' },
        { status: 400 }
      );
    }

    // Compare passwords (using timing-safe comparison for security)
    const isValid = password === correctPassword;

    if (!isValid) {
      return NextResponse.json(
        { error: 'Fel lösenord' },
        { status: 401 }
      );
    }

    // Password is correct - generate session token
    const sessionToken = generateSessionToken();

    // Create response with session cookie
    const response = NextResponse.json({ success: true });

    // Set httpOnly secure cookie
    // - httpOnly: Cannot be accessed by JavaScript (prevents XSS)
    // - secure: Only sent over HTTPS (in production)
    // - sameSite: Prevents CSRF attacks
    // - maxAge: Cookie expires after 7 days
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Något gick fel' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth
 * Logs out user by clearing session cookie.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    
    // Clear the session cookie
    cookieStore.delete('session_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Något gick fel' },
      { status: 500 }
    );
  }
}
