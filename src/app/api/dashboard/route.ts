import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });
    const user = await db.user.findUnique({ where: { id: student.userId } });

    // Attendance
    const totalAtt = await db.attendance.count({ where: { studentId: student.id } });
    const presentAtt = await db.attendance.count({
      where: { studentId: student.id, status: { in: ['present', 'late'] } }
    });
    const attendancePct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 1000) / 10 : 0;

    const remainingClasses = 45;
    const predictedPct = Math.round(((presentAtt + remainingClasses * 0.85) / (totalAtt + remainingClasses)) * 1000) / 10;
    const risk = predictedPct < 75 ? 'HIGH' : predictedPct < 80 ? 'MEDIUM' : 'LOW';
    const safeLeaves = Math.max(0, Math.floor((totalAtt + remainingClasses) * 0.75 - presentAtt));

    // Assignments
    const submittedIds = (await db.assignmentSubmission.findMany({
      where: { studentId: student.id, status: 'submitted' },
      select: { assignmentId: true }
    })).map(s => s.assignmentId);
    const pendingAssignments = await db.assignment.count({
      where: { dueDate: { gt: new Date() }, id: { notIn: submittedIds } }
    });

    // Events
    const upcomingEvents = await db.event.count({ where: { startDate: { gt: new Date() } } });
    const registeredEvents = await db.eventParticipant.count({ where: { studentId: student.id } });

    // Fees
    const pendingFees = await db.fee.count({ where: { studentId: student.id, paid: false } });

    // Library
    const borrowedBooks = await db.bookTransaction.count({
      where: { studentId: student.id, status: 'borrowed' }
    });
    const overdueBooks = await db.bookTransaction.count({
      where: { studentId: student.id, status: 'borrowed', dueDate: { lt: new Date() } }
    });

    // Placements
    const placements = await db.placement.findMany({ where: { studentId: student.id } });
    const placementSummary: Record<string, number> = {};
    placements.forEach(p => { placementSummary[p.status] = (placementSummary[p.status] || 0) + 1; });

    // Notifications
    const unreadNotifs = await db.notification.count({
      where: { userId: user!.id, read: false }
    });

    // Skills
    const skills = student.skills ? JSON.parse(student.skills) : [];

    // Readiness
    const readiness = Math.min(100, Math.round(
      student.cgpa * 10 * 0.3 + Math.min(skills.length * 8, 30) + 20 + 10
    ));
    const stressLevel = Math.min(100, Math.max(20, 100 - attendancePct + pendingAssignments * 5 - Math.floor(readiness / 3)));

    return NextResponse.json({
      student: {
        id: student.id, name: user?.name, email: user?.email,
        rollNumber: student.rollNumber, department: student.department,
        semester: student.semester, section: student.section,
        cgpa: student.cgpa, hostelRoom: student.hostelRoom,
        skills, placementStatus: student.placementStatus,
      },
      attendance: {
        percentage: attendancePct, totalClasses: totalAtt,
        presentClasses: presentAtt, predicted: predictedPct,
        risk, safeLeaves,
      },
      assignments: { pending: pendingAssignments },
      events: { upcoming: upcomingEvents, registered: registeredEvents },
      fees: { pending: pendingFees },
      library: { borrowed: borrowedBooks, overdue: overdueBooks },
      placements: placementSummary,
      notifications: { unread: unreadNotifs },
      readiness, stressLevel,
      _backend: 'nextjs-prisma',
      _pythonBackend: 'http://127.0.0.1:8001',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
