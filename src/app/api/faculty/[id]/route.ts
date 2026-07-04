import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const faculty = await db.faculty.findUnique({
      where: { id },
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
              include: {
                student: {
                  include: {
                    user: {
                      select: { name: true, email: true, avatar: true },
                    },
                  },
                },
              },
            },
            _count: {
              select: { attendance: true, assignments: true },
            },
          },
        },
      },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    const totalStudents = faculty.subjects.reduce(
      (sum, s) => sum + s.enrollments.length,
      0
    );
    const totalCredits = faculty.subjects.reduce(
      (sum, s) => sum + s.credits,
      0
    );

    // Build schedule from subject schedules
    const schedule = faculty.subjects
      .filter((s) => s.schedule)
      .map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
        subjectCode: s.code,
        schedule: s.schedule,
        semester: s.semester,
      }));

    const formattedSubjects = faculty.subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      semester: s.semester,
      credits: s.credits,
      schedule: s.schedule,
      studentCount: s.enrollments.length,
      attendanceRecordCount: s._count.attendance,
      assignmentCount: s._count.assignments,
      students: s.enrollments.map((e) => ({
        enrollmentId: e.id,
        studentId: e.student.id,
        rollNumber: e.student.rollNumber,
        name: e.student.user.name,
        email: e.student.user.email,
        avatar: e.student.user.avatar,
        semester: e.student.semester,
        section: e.student.section,
        cgpa: e.student.cgpa,
      })),
    }));

    return NextResponse.json({
      faculty: {
        id: faculty.id,
        department: faculty.department,
        designation: faculty.designation,
        cabinLocation: faculty.cabinLocation,
        createdAt: faculty.createdAt,
        updatedAt: faculty.updatedAt,
        user: faculty.user,
      },
      subjects: formattedSubjects,
      schedule,
      summary: {
        totalSubjects: faculty.subjects.length,
        totalStudents,
        totalCredits,
      },
    });
  } catch (error: any) {
    console.error('Faculty detail GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
