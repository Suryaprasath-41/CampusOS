import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalStudents = await db.student.count();
    const totalFaculty = await db.faculty.count();
    const avgCgpa = await db.student.aggregate({ _avg: { cgpa: true } });

    const totalAtt = await db.attendance.count();
    const presentAtt = await db.attendance.count({ where: { status: { in: ['present', 'late'] } } });
    const avgAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 1000) / 10 : 0;

    const totalFees = await db.fee.aggregate({ _sum: { amount: true } });
    const paidFees = await db.fee.aggregate({ _sum: { amount: true }, where: { paid: true } });

    const depts = await db.student.groupBy({ by: ['department'], _count: true });
    const placements = await db.placement.groupBy({ by: ['status'], _count: true });

    return NextResponse.json({
      stats: {
        totalStudents, totalFaculty,
        avgCGPA: Math.round(avgCgpa._avg.cgpa || 0),
        avgAttendance,
        totalFees: totalFees._sum.amount || 0,
        paidFees: paidFees._sum.amount || 0,
        pendingFees: (totalFees._sum.amount || 0) - (paidFees._sum.amount || 0),
      },
      departments: depts.map(d => ({ department: d.department, count: d._count })),
      placements: Object.fromEntries(placements.map(p => [p.status, p._count])),
      recentActivity: [
        { type: 'enrollment', message: 'New student enrolled in Computer Science', time: '2 hours ago' },
        { type: 'fee', message: 'Fee payment of ₹75,000 received', time: '3 hours ago' },
        { type: 'placement', message: 'Google campus drive scheduled', time: '5 hours ago' },
        { type: 'event', message: 'CodeStorm Hackathon registration opened', time: '1 day ago' },
        { type: 'complaint', message: '3 new hostel complaints received', time: '1 day ago' },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
