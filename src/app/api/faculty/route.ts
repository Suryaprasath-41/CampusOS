import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || '';
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (department) {
      where.department = department;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { designation: { contains: search } },
      ];
    }

    const faculty = await db.faculty.findMany({
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
        subjects: {
          include: {
            enrollments: {
              select: { id: true, studentId: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = faculty.map((f) => {
      const totalStudents = f.subjects.reduce(
        (sum, s) => sum + s.enrollments.length,
        0
      );

      return {
        id: f.id,
        name: f.user.name,
        email: f.user.email,
        phone: f.user.phone,
        avatar: f.user.avatar,
        department: f.department,
        designation: f.designation,
        cabinLocation: f.cabinLocation,
        subjects: f.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          semester: s.semester,
          credits: s.credits,
          schedule: s.schedule,
          studentCount: s.enrollments.length,
        })),
        subjectCount: f.subjects.length,
        totalStudents,
      };
    });

    return NextResponse.json({ faculty: formatted, total: formatted.length });
  } catch (error: any) {
    console.error('Faculty list GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
