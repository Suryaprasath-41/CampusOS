import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '../login/route';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('campusos-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No session token found', authenticated: false },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired session', authenticated: false },
        { status: 401 }
      );
    }

    // Fetch fresh user data from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        phone: user.phone,
      },
      tokenIssuedAt: decoded.timestamp,
      tokenExpiresAt: decoded.timestamp + 86400 * 1000,
    });
  } catch (error: unknown) {
    console.error('Session info error:', error);
    return NextResponse.json(
      { error: 'Internal server error', authenticated: false },
      { status: 500 }
    );
  }
}
