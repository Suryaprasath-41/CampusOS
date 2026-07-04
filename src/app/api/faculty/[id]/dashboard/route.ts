import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: facultyId } = await params;

    // Validate faculty exists
    const faculty = await db.faculty.findUnique({
      where: { id: facultyId },
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

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Get all subjects for this faculty
    const subjects = await db.subject.findMany({
      where: { facultyId },
      include: {
        enrollments: {
          select: { studentId: true },
        },
        assignments: {
          include: {
            submissions: {
              select: {
                id: true,
                marks: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const subjectIds = subjects.map((s) => s.id);

    // Compute stats
    const classCount = subjects.length;

    // Total unique students across all subjects
    const allStudentIds = new Set<string>();
    subjects.forEach((s) => {
      s.enrollments.forEach((e) => allStudentIds.add(e.studentId));
    });
    const totalStudents = allStudentIds.size;

    // Today's classes - subjects that have schedule containing today's day name
    const today = new Date();
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const todayName = dayNames[today.getDay()];
    const todayClasses = subjects.filter(
      (s) => s.schedule && s.schedule.toLowerCase().includes(todayName.toLowerCase())
    ).length;

    // Pending reviews - submissions that are 'submitted' but not yet graded
    let pendingReviews = 0;
    const allAssignments: any[] = [];
    subjects.forEach((s) => {
      s.assignments.forEach((a) => {
        const pendingCount = a.submissions.filter(
          (sub) => sub.status === 'submitted' || sub.status === 'pending'
        ).length;
        pendingReviews += pendingCount;

        allAssignments.push({
          id: a.id,
          title: a.title,
          subjectId: a.subjectId,
          subjectName: s.name,
          subjectCode: s.code,
          dueDate: a.dueDate.toISOString(),
          maxMarks: a.maxMarks,
          totalSubmissions: a.submissions.length,
          pendingSubmissions: pendingCount,
          gradedSubmissions: a.submissions.filter(
            (sub) => sub.status === 'graded'
          ).length,
        });
      });
    });

    // Research count - placeholder (no Research model in schema)
    const researchCount = 0;

    // AI queries - count conversations related to this faculty's subjects
    const aiQueries = await db.conversation.count({
      where: {
        student: {
          enrollments: {
            some: {
              subjectId: { in: subjectIds },
            },
          },
        },
      },
    });

    // Build schedule from subject schedules
    const schedule = subjects
      .filter((s) => s.schedule)
      .map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
        subjectCode: s.code,
        schedule: s.schedule,
        semester: s.semester,
        studentCount: s.enrollments.length,
      }));

    // Recent AI queries by students in this faculty's subjects
    const recentQueries = await db.conversation.findMany({
      where: {
        student: {
          enrollments: {
            some: {
              subjectId: { in: subjectIds },
            },
          },
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Attendance overview per subject
    const attendanceOverview = await Promise.all(
      subjects.map(async (s) => {
        const totalRecords = await db.attendance.count({
          where: { subjectId: s.id },
        });
        const presentCount = await db.attendance.count({
          where: {
            subjectId: s.id,
            status: { in: ['present', 'late'] },
          },
        });
        const percentage =
          totalRecords > 0
            ? Math.round((presentCount / totalRecords) * 1000) / 10
            : 0;

        return {
          subjectId: s.id,
          subjectName: s.name,
          subjectCode: s.code,
          totalRecords,
          presentCount,
          absentCount: totalRecords - presentCount,
          percentage,
        };
      })
    );

    // Recent attendance records (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAttendance = await db.attendance.findMany({
      where: {
        subjectId: { in: subjectIds },
        date: { gte: sevenDaysAgo },
      },
      include: {
        subject: {
          select: { name: true, code: true },
        },
        student: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      faculty: {
        id: faculty.id,
        name: faculty.user.name,
        email: faculty.user.email,
        department: faculty.department,
        designation: faculty.designation,
        cabinLocation: faculty.cabinLocation,
        avatar: faculty.user.avatar,
      },
      stats: {
        classCount,
        totalStudents,
        todayClasses,
        pendingReviews,
        researchCount,
        aiQueries,
      },
      schedule,
      attendanceOverview,
      assignments: allAssignments,
      recentQueries: recentQueries.map((q) => ({
        id: q.id,
        studentId: q.studentId,
        studentName: q.student.user.name,
        studentRollNumber: q.student.rollNumber,
        role: q.role,
        content: q.content,
        agentType: q.agentType,
        createdAt: q.createdAt.toISOString(),
      })),
      recentAttendance: recentAttendance.map((r) => ({
        id: r.id,
        date: r.date.toISOString(),
        status: r.status,
        subject: r.subject,
        studentName: r.student.user.name,
        studentRollNumber: r.student.rollNumber,
      })),
    });
  } catch (error: any) {
    console.error('Faculty dashboard GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
