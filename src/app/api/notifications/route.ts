import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });
    const user = await db.user.findUnique({ where: { id: student.userId } });

    const notifs = await db.notification.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      notifications: notifs.map(n => ({
        id: n.id, title: n.title, message: n.message,
        type: n.type, read: n.read, actionUrl: n.actionUrl,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount: notifs.filter(n => !n.read).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
