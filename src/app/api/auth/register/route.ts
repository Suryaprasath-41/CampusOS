import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../login/route';

// Email regex for basic format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // Verify admin via custom token
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('campusos-token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Decode and verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create users' }, { status: 403 });
    }

    const body = await req.json();
    let { email, password, name, role, department } = body;

    // Input validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields (email, password, name, role)' },
        { status: 400 }
      );
    }

    // Trim inputs
    email = email.trim();
    name = name.trim();

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Auto-append @JSE.com if no domain provided
    if (!email.includes('@')) {
      email = `${email}@JSE.com`;
    }

    // Enforce @JSE.com domain
    if (!email.endsWith('@JSE.com')) {
      return NextResponse.json(
        { error: 'All accounts must use @JSE.com email domain' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['student', 'faculty', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be student, faculty, or admin' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
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

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
