import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Verify admin via custom token
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('campusos-token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Decode token to check role
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [, , role] = decoded.split(':');
      if (role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can create users' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, role, department } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password, // Plain text for now - will be hashed by bcrypt on login check
        name,
        role,
        department: department || null,
      },
    });

    // Create role-specific records
    if (role === 'student') {
      await db.student.create({
        data: {
          userId: user.id,
          rollNumber: `STU${Date.now()}`,
          department: department || 'CS',
          semester: 1,
          section: 'A',
          cgpa: 0,
          skills: '',
          placementStatus: 'seeking',
        },
      });
    } else if (role === 'faculty') {
      await db.faculty.create({
        data: {
          userId: user.id,
          department: department || 'CS',
          designation: 'Assistant Professor',
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
