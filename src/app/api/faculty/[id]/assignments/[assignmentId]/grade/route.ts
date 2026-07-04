import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const { id: facultyId, assignmentId } = await params;
    const body = await request.json();
    const { submissionId, marks, feedback } = body;

    // Validate required fields
    if (!submissionId || marks === undefined || marks === null) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionId, marks' },
        { status: 400 }
      );
    }

    // Validate marks is a valid number
    if (typeof marks !== 'number' || marks < 0) {
      return NextResponse.json(
        { error: 'Marks must be a non-negative number' },
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

    // Validate assignment belongs to a subject taught by this faculty
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: {
          select: { id: true, facultyId: true, name: true, code: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    if (assignment.subject.facultyId !== facultyId) {
      return NextResponse.json(
        { error: 'Assignment does not belong to this faculty' },
        { status: 403 }
      );
    }

    // Validate submission belongs to this assignment
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.assignmentId !== assignmentId) {
      return NextResponse.json(
        { error: 'Submission does not belong to this assignment' },
        { status: 400 }
      );
    }

    // Validate marks don't exceed max marks
    if (marks > assignment.maxMarks) {
      return NextResponse.json(
        {
          error: `Marks (${marks}) exceed maximum marks (${assignment.maxMarks})`,
          maxMarks: assignment.maxMarks,
        },
        { status: 400 }
      );
    }

    // Update the submission with marks and feedback
    const updatedSubmission = await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marks,
        feedback: feedback || null,
        status: 'graded',
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true, avatar: true },
            },
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            maxMarks: true,
            subject: {
              select: { name: true, code: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Submission graded successfully',
      submission: {
        id: updatedSubmission.id,
        studentId: updatedSubmission.studentId,
        studentName: updatedSubmission.student.user.name,
        studentRollNumber: updatedSubmission.student.rollNumber,
        assignmentId: updatedSubmission.assignmentId,
        assignmentTitle: updatedSubmission.assignment.title,
        subject: updatedSubmission.assignment.subject,
        marks: updatedSubmission.marks,
        maxMarks: updatedSubmission.assignment.maxMarks,
        feedback: updatedSubmission.feedback,
        status: updatedSubmission.status,
        submittedAt: updatedSubmission.submittedAt?.toISOString() || null,
        gradedAt: updatedSubmission.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Faculty grade PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
