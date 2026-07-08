import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const semester = searchParams.get('semester') || '';
    const placementStatus = searchParams.get('placementStatus') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { rollNumber: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    if (department) {
      where.department = department;
    }

    if (semester) {
      where.semester = parseInt(semester);
    }

    if (placementStatus) {
      where.placementStatus = placementStatus;
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.student.count({ where }),
    ]);

    const formatted = students.map((s) => ({
      id: s.id,
      rollNumber: s.rollNumber,
      department: s.department,
      semester: s.semester,
      section: s.section,
      cgpa: s.cgpa,
      placementStatus: s.placementStatus,
      hostelRoom: s.hostelRoom,
      skills: s.skills,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      createdAt: s.createdAt,
      user: s.user,
    }));

    return NextResponse.json({ students: formatted, total, page, limit });
  } catch (error: any) {
    console.error('Admin students GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, rollNumber, department, semester, section, phone, guardianName, guardianPhone, skills } = body;

    if (!name || !email || !rollNumber || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, rollNumber, department' },
        { status: 400 }
      );
    }

    // Check if email or rollNumber already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const existingStudent = await db.student.findUnique({ where: { rollNumber } });
    if (existingStudent) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 409 });
    }

    // Create User first, then Student
    const user = await db.user.create({
      data: {
        name,
        email,
        role: 'student',
        phone: phone || null,
        department,
      },
    });

    const student = await db.student.create({
      data: {
        userId: user.id,
        rollNumber,
        department,
        semester: semester || 1,
        section: section || 'A',
        guardianName: guardianName || null,
        guardianPhone: guardianPhone || null,
        skills: skills || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error: any) {
    console.error('Admin students POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
