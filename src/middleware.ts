import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// HMAC secret — must match the one in login route
const HMAC_SECRET = process.env.CAMPUOS_HMAC_SECRET || 'campusos-ai-hmac-secret-2025-jse';

// Convert string to Uint8Array for Web Crypto API
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Base64 decode to string (Edge Runtime compatible)
function base64Decode(str: string): string {
  return atob(str);
}

// Verify HMAC using Web Crypto API (Edge Runtime compatible)
async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string; timestamp: number } | null> {
  try {
    const decoded = base64Decode(token);
    const parts = decoded.split(':');
    if (parts.length !== 5) return null;

    const [userId, email, role, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return null;

    // Check token expiry (24 hours)
    if (Date.now() - timestamp > 86400 * 1000) return null;

    // Verify HMAC signature using Web Crypto API
    const payload = `${userId}:${email}:${role}:${timestamp}`;
    const keyData = stringToUint8Array(HMAC_SECRET);
    const msgData = stringToUint8Array(payload);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, msgData);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) return null;

    return { userId, email, role, timestamp };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page without authentication
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Allow all auth API routes without authentication
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Allow static files, _next, etc.
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static assets typically have extensions
  ) {
    return NextResponse.next();
  }

  // Protect the / route and all other routes
  const token = request.cookies.get('campusos-token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token structure and HMAC signature
  const decoded = await verifyToken(token);

  if (!decoded) {
    // Invalid or expired token — redirect to login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // Clear the invalid cookie
    response.cookies.set('campusos-token', '', { path: '/', maxAge: 0 });
    return response;
  }

  // Token is valid — allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
