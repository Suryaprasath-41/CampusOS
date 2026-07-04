import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// HMAC secret — in production, use an env variable
const HMAC_SECRET = process.env.CAMPUOS_HMAC_SECRET || 'campusos-ai-hmac-secret-2025-jse';

// Simple in-memory rate limiter
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const record = loginAttempts.get(ip);
  if (!record) return false;

  // Reset if window has passed
  if (Date.now() - record.lastAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string) {
  const record = loginAttempts.get(ip);
  if (!record || Date.now() - record.lastAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
  } else {
    record.count++;
    record.lastAttempt = Date.now();
  }
}

function clearAttempt(ip: string) {
  loginAttempts.delete(ip);
}

// Generate HMAC-signed token
function generateToken(userId: string, email: string, role: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${email}:${role}:${timestamp}`;
  const signature = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
  // Token format: base64(userId:email:role:timestamp:signature)
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

// Verify HMAC-signed token
export function verifyToken(token: string): { userId: string; email: string; role: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const parts = decoded.split(':');
    if (parts.length !== 5) return null;

    const [userId, email, role, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return null;

    // Check token expiry (24 hours)
    if (Date.now() - timestamp > 86400 * 1000) return null;

    // Verify HMAC signature
    const payload = `${userId}:${email}:${role}:${timestamp}`;
    const expectedSignature = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');

    if (signature !== expectedSignature) return null;

    return { userId, email, role, timestamp };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    if (!user) {
      recordAttempt(ip);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Password verification: try bcrypt first, then plain-text fallback
    let passwordMatches = false;
    let isPlainPassword = false;

    // Check if the stored password looks like a bcrypt hash
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      // Stored password is a bcrypt hash — use bcrypt compare
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      // Stored password is plain text — try direct comparison
      if (user.password === password) {
        passwordMatches = true;
        isPlainPassword = true;
      }
    }

    if (!passwordMatches) {
      recordAttempt(ip);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Auto-migration: if password was plain text and matched, re-hash with bcrypt
    if (isPlainPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    // Clear rate limit on successful login
    clearAttempt(ip);

    // Generate HMAC-signed token
    const token = generateToken(user.id, user.email, user.role);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set cookie on response
    response.cookies.set('campusos-token', token, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
