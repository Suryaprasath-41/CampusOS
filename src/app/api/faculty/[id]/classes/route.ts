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
      select: { id: true },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Get all subjects assigned to this faculty with enrolled students
    const subjects = await db.subject.findMany({
      where: { facultyId: id },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                user: {
                  select: { name: true, email: true, avatar: true },
                },
                attendance: {
                  where: { subjectId: undefined }, // will filter per subject below
                  select: { status: true, date: true },
                },
              },
            },
          },
        },
      },
      orderBy: { semester: 'asc' },
    });

    // For each subject, compute attendance summary
    const classesWithAttendance = await Promise.all(
      subjects.map(async (subject) => {
        // Get attendance summary for this subject
        const totalRecords = await db.attendance.count({
          where: { subjectId: subject.id },
        });

        const presentCount = await db.attendance.count({
          where: {
            subjectId: subject.id,
            status: { in: ['present', 'late'] },
          },
        });

        const absentCount = await db.attendance.count({
          where: { subjectId: subject.id, status: 'absent' },
        });

        const lateCount = await db.attendance.count({
          where: { subjectId: subject.id, status: 'late' },
        });

        const attendancePercentage =
          totalRecords > 0
            ? Math.round((presentCount / totalRecords) * 1000) / 10
            : 0;

        // Get per-student attendance for this subject
        const studentsWithAttendance = await Promise.all(
          subject.enrollments.map(async (enrollment) => {
            const studentTotal = await db.attendance.count({
              where: {
                subjectId: subject.id,
                studentId: enrollment.studentId,
              },
            });

            const studentPresent = await db.attendance.count({
              where: {
                subjectId: subject.id,
                studentId: enrollment.studentId,
                status: { in: ['present', 'late'] },
              },
            });

            const studentAbsent = await db.attendance.count({
              where: {
                subjectId: subject.id,
                studentId: enrollment.studentId,
                status: 'absent',
              },
            });

            const studentPct =
              studentTotal > 0
                ? Math.round((studentPresent / studentTotal) * 1000) / 10
                : 0;

            return {
              enrollmentId: enrollment.id,
              studentId: enrollment.student.id,
              rollNumber: enrollment.student.rollNumber,
              name: enrollment.student.user.name,
              email: enrollment.student.user.email,
              avatar: enrollment.student.user.avatar,
              semester: enrollment.student.semester,
              section: enrollment.student.section,
              cgpa: enrollment.student.cgpa,
              attendance: {
                total: studentTotal,
                present: studentPresent,
                absent: studentAbsent,
                percentage: studentPct,
              },
            };
          })
        );

        return {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          department: subject.department,
          semester: subject.semester,
          credits: subject.credits,
          schedule: subject.schedule,
          studentCount: subject.enrollments.length,
          attendanceSummary: {
            totalRecords,
            presentCount,
            absentCount,
            lateCount,
            attendancePercentage,
          },
          students: studentsWithAttendance,
        };
      })
    );

    return NextResponse.json({
      classes: classesWithAttendance,
      totalClasses: classesWithAttendance.length,
    });
  } catch (error: any) {
    console.error('Faculty classes GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
