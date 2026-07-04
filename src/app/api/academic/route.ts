import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    const enrollments = await db.subjectEnrollment.findMany({
      where: { studentId: student.id },
      include: {
        subject: {
          include: {
            faculty: { include: { user: { select: { name: true } } } }
          }
        }
      }
    });

    const subjectsData = await Promise.all(enrollments.map(async (e) => {
      const marks = await db.internalMark.findFirst({
        where: { studentId: student.id, subjectId: e.subjectId }
      });
      return {
        code: e.subject.code, name: e.subject.name, credits: e.subject.credits,
        faculty: e.subject.faculty?.user?.name || 'TBA',
        marks: marks ? {
          test1: marks.test1, test2: marks.test2,
          assignment1: marks.assignment1, assignment2: marks.assignment2,
          total: marks.total, maxMarks: marks.maxMarks,
        } : null,
      };
    }));

    const schedule = enrollments.map(e => {
      let sched: any = {};
      try { sched = e.subject.schedule ? JSON.parse(e.subject.schedule as string) : {}; } catch {}
      return {
        subject: e.subject.name, code: e.subject.code,
        days: sched.days || [], time: sched.time || 'TBA',
        room: sched.room || 'TBA',
        faculty: e.subject.faculty?.user?.name || 'TBA',
      };
    });

    const submittedIds = (await db.assignmentSubmission.findMany({
      where: { studentId: student.id, status: 'submitted' },
      select: { assignmentId: true }
    })).map(s => s.assignmentId);

    const pendingAssignments = await db.assignment.findMany({
      where: { dueDate: { gt: new Date() }, id: { notIn: submittedIds } },
      include: { subject: { select: { name: true } } }
    });

    const submittedAssignments = await db.assignment.findMany({
      where: { id: { in: submittedIds } },
      include: { subject: { select: { name: true } } }
    });

    return NextResponse.json({
      subjects: subjectsData,
      schedule,
      assignments: {
        pending: pendingAssignments.map(a => ({
          id: a.id, title: a.title, description: a.description,
          subject: a.subject.name, dueDate: a.dueDate.toISOString(),
          maxMarks: a.maxMarks, status: 'pending',
        })),
        submitted: submittedAssignments.map(a => ({
          id: a.id, title: a.title, description: a.description,
          subject: a.subject.name, dueDate: a.dueDate.toISOString(),
          maxMarks: a.maxMarks, status: 'submitted',
        })),
      },
      semester: student.semester,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
