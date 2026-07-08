import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    const complaints = await db.complaint.findMany({ where: { studentId: student.id } });
    const leaves = await db.leaveRequest.findMany({ where: { studentId: student.id } });

    const messMenu: Record<string, Record<string, string>> = {
      Monday: { breakfast: 'Poha + Toast + Tea', lunch: 'Rice + Dal + Sabzi + Salad', dinner: 'Chapati + Paneer + Rice' },
      Tuesday: { breakfast: 'Idli + Sambar + Tea', lunch: 'Rice + Sambar + Chicken + Salad', dinner: 'Chapati + Dal + Sabzi' },
      Wednesday: { breakfast: 'Upma + Toast + Tea', lunch: 'Rice + Dal + Fish + Salad', dinner: 'Chapati + Chole + Rice' },
      Thursday: { breakfast: 'Dosa + Chutney + Tea', lunch: 'Rice + Dal + Paneer + Salad', dinner: 'Chapati + Chicken + Rice' },
      Friday: { breakfast: 'Bread + Butter + Tea', lunch: 'Biryani + Raita + Salad', dinner: 'Chapati + Dal + Sabzi' },
      Saturday: { breakfast: 'Paratha + Curd + Tea', lunch: 'Rice + Dal + Egg Curry + Salad', dinner: 'Chapati + Paneer + Rice' },
      Sunday: { breakfast: 'Chole Bhature + Tea', lunch: 'Special Thali', dinner: 'Chapati + Chicken + Rice + Dessert' },
    };

    return NextResponse.json({
      room: { number: student.hostelRoom || 'N/A', block: 'H4', type: 'Double Sharing', status: 'Occupied' },
      complaints: complaints.map(c => ({
        id: c.id, type: c.type, description: c.description,
        status: c.status, priority: c.priority, createdAt: c.createdAt.toISOString(),
      })),
      leaves: leaves.map(l => ({
        id: l.id, type: l.type, startDate: l.startDate.toISOString(),
        endDate: l.endDate.toISOString(), reason: l.reason,
        status: l.status, approvedBy: l.approvedBy,
      })),
      messMenu,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
