import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    const events = await db.event.findMany({
      where: { startDate: { gt: new Date() } },
      orderBy: { startDate: 'asc' }
    });
    const registeredIds = (await db.eventParticipant.findMany({
      where: { studentId: student.id },
      select: { eventId: true }
    })).map(p => p.eventId);

    const eventsList = await Promise.all(events.map(async (e) => {
      const pCount = await db.eventParticipant.count({ where: { eventId: e.id } });
      return {
        id: e.id, title: e.title, description: e.description,
        type: e.type, organizer: e.organizer,
        startDate: e.startDate.toISOString(), endDate: e.endDate?.toISOString(),
        venue: e.venue, registrationOpen: e.registrationOpen,
        maxParticipants: e.maxParticipants, currentParticipants: pCount,
        registered: registeredIds.includes(e.id),
      };
    }));

    return NextResponse.json({
      events: eventsList,
      registered: eventsList.filter(e => e.registered),
      categories: [...new Set(eventsList.map(e => e.type))],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
