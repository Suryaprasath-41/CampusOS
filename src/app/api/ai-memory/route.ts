import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    const memories = await db.aiMemory.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const conversationCount = await db.conversation.count({
      where: { studentId: student.id },
    });

    const recentConversations = await db.conversation.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const memoriesByCategory: Record<string, number> = {};
    memories.forEach(m => {
      memoriesByCategory[m.category] = (memoriesByCategory[m.category] || 0) + 1;
    });

    return NextResponse.json({
      memories: memories.map(m => ({
        id: m.id,
        category: m.category,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      memoriesByCategory,
      totalMemories: memories.length,
      totalConversations: conversationCount,
      recentConversations: recentConversations.map(c => ({
        id: c.id,
        role: c.role,
        agentType: c.agentType,
        content: c.content.slice(0, 120) + (c.content.length > 120 ? '...' : ''),
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      await db.aiMemory.delete({ where: { id } });
      return NextResponse.json({ success: true, deleted: id });
    }

    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });
    await db.aiMemory.deleteMany({ where: { studentId: student.id } });
    return NextResponse.json({ success: true, deleted: 'all' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
