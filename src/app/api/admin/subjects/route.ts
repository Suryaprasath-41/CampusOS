import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || '';
    const semester = searchParams.get('semester') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (department) {
      where.department = department;
    }
    if (semester) {
      where.semester = parseInt(semester);
    }

    const [subjects, total] = await Promise.all([
      db.subject.findMany({
        where,
        include: {
          faculty: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.subject.count({ where }),
    ]);

    const formatted = subjects.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      department: s.department,
      semester: s.semester,
      credits: s.credits,
      schedule: s.schedule,
      facultyId: s.facultyId,
      faculty: {
        id: s.faculty.id,
        name: s.faculty.user.name,
        email: s.faculty.user.email,
        designation: s.faculty.designation,
      },
      enrollmentCount: s._count.enrollments,
    }));

    return NextResponse.json({ subjects: formatted, total, page, limit });
  } catch (error: any) {
    console.error('Admin subjects GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, department, semester, credits, facultyId, schedule } = body;

    if (!name || !code || !department || !semester || !facultyId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, code, department, semester, facultyId' },
        { status: 400 }
      );
    }

    // Check if subject code already exists
    const existingSubject = await db.subject.findUnique({ where: { code } });
    if (existingSubject) {
      return NextResponse.json({ error: 'Subject code already exists' }, { status: 409 });
    }

    // Check if faculty exists
    const faculty = await db.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    const subject = await db.subject.create({
      data: {
        name,
        code,
        department,
        semester: parseInt(String(semester)),
        credits: credits || 3,
        facultyId,
        schedule: schedule || null,
      },
      include: {
        faculty: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error: any) {
    console.error('Admin subjects POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
