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
              select: { id: true, studentId: true },
            },
          },
        },
      },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Compute summary stats
    const totalStudents = faculty.subjects.reduce(
      (sum, s) => sum + s.enrollments.length,
      0
    );
    const totalCredits = faculty.subjects.reduce((sum, s) => sum + s.credits, 0);

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
      subjects: faculty.subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        semester: s.semester,
        credits: s.credits,
        schedule: s.schedule,
        enrollmentCount: s.enrollments.length,
      })),
      summary: {
        totalSubjects: faculty.subjects.length,
        totalStudents,
        totalCredits,
      },
    });
  } catch (error: any) {
    console.error('Admin faculty GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const faculty = await db.faculty.findUnique({ where: { id } });
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Separate faculty fields from user fields
    const facultyFields: any = {};
    const userFields: any = {};

    if (body.department !== undefined) facultyFields.department = body.department;
    if (body.designation !== undefined) facultyFields.designation = body.designation;
    if (body.cabinLocation !== undefined) facultyFields.cabinLocation = body.cabinLocation;

    if (body.name !== undefined) userFields.name = body.name;
    if (body.email !== undefined) userFields.email = body.email;
    if (body.phone !== undefined) userFields.phone = body.phone;
    if (body.department !== undefined) userFields.department = body.department;

    // Update user fields if any
    if (Object.keys(userFields).length > 0) {
      await db.user.update({
        where: { id: faculty.userId },
        data: userFields,
      });
    }

    // Update faculty fields if any
    if (Object.keys(facultyFields).length > 0) {
      await db.faculty.update({
        where: { id },
        data: facultyFields,
      });
    }

    const updatedFaculty = await db.faculty.findUnique({
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
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
            credits: true,
          },
        },
      },
    });

    return NextResponse.json({ faculty: updatedFaculty });
  } catch (error: any) {
    console.error('Admin faculty PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const faculty = await db.faculty.findUnique({
      where: { id },
      select: { userId: true, subjects: { select: { id: true } } },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Check if faculty has assigned subjects
    if (faculty.subjects.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete faculty with assigned subjects. Please reassign or delete subjects first.',
          subjectCount: faculty.subjects.length,
        },
        { status: 409 }
      );
    }

    // Delete faculty first, then user
    await db.faculty.delete({ where: { id } });
    await db.user.delete({ where: { id: faculty.userId } });

    return NextResponse.json({ message: 'Faculty and associated user deleted successfully' });
  } catch (error: any) {
    console.error('Admin faculty DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
