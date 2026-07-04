import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/faculty/[id]/assignments - Get assignments created by faculty
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: facultyId } = await params;

    const faculty = await db.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Get all subjects for this faculty, then their assignments
    const subjects = await db.subject.findMany({
      where: { facultyId },
      select: { id: true },
    });

    const subjectIds = subjects.map((s) => s.id);

    const assignments = await db.assignment.findMany({
      where: { subjectId: { in: subjectIds } },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
            department: true,
          },
        },
        submissions: {
          select: {
            id: true,
            studentId: true,
            submittedAt: true,
            marks: true,
            status: true,
            student: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    const formatted = assignments.map((a) => {
      const submissionCount = a.submissions.length;
      const gradedSubmissions = a.submissions.filter(
        (s) => s.marks !== null && s.marks !== undefined
      );
      const averageScore =
        gradedSubmissions.length > 0
          ? Math.round(
              (gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0) /
                gradedSubmissions.length) *
                100
            ) / 100
          : null;

      const pendingSubmissions = a.submissions.filter(
        (s) => s.status === 'pending'
      ).length;
      const submittedSubmissions = a.submissions.filter(
        (s) => s.status === 'submitted'
      ).length;
      const gradedCount = gradedSubmissions.length;

      // Count total enrolled students for completion rate
      const totalEnrolled = 0; // Will be computed per-subject

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate.toISOString(),
        maxMarks: a.maxMarks,
        createdAt: a.createdAt.toISOString(),
        subject: a.subject,
        submissionStats: {
          total: submissionCount,
          pending: pendingSubmissions,
          submitted: submittedSubmissions,
          graded: gradedCount,
        },
        averageScore,
        submissions: a.submissions.map((s) => ({
          id: s.id,
          studentId: s.studentId,
          studentName: s.student.user.name,
          studentRollNumber: s.student.rollNumber,
          submittedAt: s.submittedAt?.toISOString() || null,
          marks: s.marks,
          status: s.status,
          feedback: s.feedback,
        })),
      };
    });

    return NextResponse.json({
      assignments: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error('Faculty assignments GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/faculty/[id]/assignments - Create a new assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: facultyId } = await params;
    const body = await request.json();
    const { subjectId, title, description, dueDate, maxMarks } = body;

    // Validate required fields
    if (!subjectId || !title || !dueDate) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: subjectId, title, dueDate',
        },
        { status: 400 }
      );
    }

    // Validate faculty exists
    const faculty = await db.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Validate subject belongs to this faculty
    const subject = await db.subject.findFirst({
      where: { id: subjectId, facultyId },
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found or not assigned to this faculty' },
        { status: 404 }
      );
    }

    // Parse and validate due date
    const dueDateParsed = new Date(dueDate);
    if (isNaN(dueDateParsed.getTime())) {
      return NextResponse.json(
        { error: 'Invalid dueDate format' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await db.assignment.create({
      data: {
        subjectId,
        title,
        description: description || null,
        dueDate: dueDateParsed,
        maxMarks: maxMarks || 10,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error: any) {
    console.error('Faculty assignments POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
