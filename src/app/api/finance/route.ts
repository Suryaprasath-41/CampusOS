import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    const fees = await db.fee.findMany({ where: { studentId: student.id } });
    const totalPaid = fees.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);
    const totalPending = fees.filter(f => !f.paid).reduce((s, f) => s + f.amount, 0);

    return NextResponse.json({
      summary: { totalPaid, totalPending, totalFees: totalPaid + totalPending },
      fees: fees.map(f => ({
        id: f.id, type: f.type, amount: f.amount, paid: f.paid,
        dueDate: f.dueDate.toISOString(), paidDate: f.paidDate?.toISOString(),
        semester: f.semester,
      })),
      scholarships: [
        { name: 'Merit Scholarship', amount: 25000, status: 'eligible', deadline: '2025-08-15' },
        { name: 'Sports Quota', amount: 15000, status: 'not_eligible', deadline: '2025-07-30' },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
