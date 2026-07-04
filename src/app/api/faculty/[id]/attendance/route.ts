import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: facultyId } = await params;
    const body = await request.json();
    const { subjectId, date, records } = body;

    // Validate required fields
    if (!subjectId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: subjectId, date, records (array of { studentId, status })',
        },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'Records array cannot be empty' },
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

    // Validate all statuses
    const validStatuses = ['present', 'absent', 'late'];
    for (const record of records) {
      if (!record.studentId || !record.status) {
        return NextResponse.json(
          { error: 'Each record must have studentId and status' },
          { status: 400 }
        );
      }
      if (!validStatuses.includes(record.status)) {
        return NextResponse.json(
          {
            error: `Invalid status "${record.status}". Must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate student IDs exist and are enrolled in the subject
    const studentIds = records.map((r: any) => r.studentId);
    const enrollments = await db.subjectEnrollment.findMany({
      where: {
        subjectId,
        studentId: { in: studentIds },
      },
    });

    const enrolledStudentIds = new Set(enrollments.map((e) => e.studentId));
    const unenrolledStudents = studentIds.filter(
      (sid: string) => !enrolledStudentIds.has(sid)
    );

    if (unenrolledStudents.length > 0) {
      return NextResponse.json(
        {
          error: 'Some students are not enrolled in this subject',
          unenrolledStudentIds: unenrolledStudents,
        },
        { status: 400 }
      );
    }

    // Parse the date
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check for existing attendance records for the same subject and date
    // (upsert behavior: update existing or create new)
    const created: any[] = [];
    const updated: any[] = [];
    const errors: any[] = [];

    for (const record of records) {
      try {
        const existing = await db.attendance.findFirst({
          where: {
            studentId: record.studentId,
            subjectId,
            date: attendanceDate,
          },
        });

        if (existing) {
          const result = await db.attendance.update({
            where: { id: existing.id },
            data: { status: record.status },
          });
          updated.push(result);
        } else {
          const result = await db.attendance.create({
            data: {
              studentId: record.studentId,
              subjectId,
              date: attendanceDate,
              status: record.status,
            },
          });
          created.push(result);
        }
      } catch (err: any) {
        errors.push({
          studentId: record.studentId,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Attendance processed successfully',
      subjectId,
      date: attendanceDate.toISOString(),
      summary: {
        totalRecords: records.length,
        created: created.length,
        updated: updated.length,
        errors: errors.length,
      },
      created: created.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        status: r.status,
      })),
      updated: updated.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        status: r.status,
      })),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Faculty attendance POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
