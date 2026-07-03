import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    // Overall attendance
    const total = await db.attendance.count({ where: { studentId: student.id } });
    const present = await db.attendance.count({ where: { studentId: student.id, status: { in: ['present', 'late'] } } });
    const absent = await db.attendance.count({ where: { studentId: student.id, status: 'absent' } });
    const late = await db.attendance.count({ where: { studentId: student.id, status: 'late' } });
    const overallPct = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;

    // Subject-wise
    const enrollments = await db.subjectEnrollment.findMany({
      where: { studentId: student.id },
      include: { subject: true }
    });

    const subjectWise = await Promise.all(enrollments.map(async (e) => {
      const sTotal = await db.attendance.count({
        where: { studentId: student.id, subjectId: e.subjectId }
      });
      const sPresent = await db.attendance.count({
        where: { studentId: student.id, subjectId: e.subjectId, status: { in: ['present', 'late'] } }
      });
      const sPct = sTotal > 0 ? Math.round((sPresent / sTotal) * 1000) / 10 : 0;
      const sRisk = sPct < 70 ? 'HIGH' : sPct < 80 ? 'MEDIUM' : 'LOW';
      return {
        subjectId: e.subject.id, code: e.subject.code, name: e.subject.name,
        total: sTotal, present: sPresent, absent: sTotal - sPresent,
        percentage: sPct, risk: sRisk,
      };
    }));

    // Prediction
    const remaining = 45;
    const predicted = Math.round(((present + remaining * 0.85) / (total + remaining)) * 1000) / 10;
    const risk = predicted < 75 ? 'HIGH' : predicted < 80 ? 'MEDIUM' : 'LOW';
    const safeLeaves = Math.max(0, Math.floor((total + remaining) * 0.75 - present));
    const requiredToAttend = present / total < 0.75 ? Math.max(0, Math.floor((total + remaining) * 0.75) - present) : 0;

    // Recent records
    const recent = await db.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
      take: 14,
      include: { subject: { select: { name: true } } }
    });

    return NextResponse.json({
      overall: { percentage: overallPct, totalClasses: total, present, absent, late },
      subjects: subjectWise,
      prediction: { current: overallPct, predicted, risk, safeLeaves, requiredToAttend, remainingClasses: remaining },
      recent: recent.map(r => ({
        date: r.date.toISOString(),
        subject: r.subject.name,
        status: r.status,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
