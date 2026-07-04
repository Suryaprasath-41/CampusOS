import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });
    const user = await db.user.findUnique({ where: { id: student.userId } });

    const skills = student.skills ? JSON.parse(student.skills) : [];

    // Achievements calculation
    const totalAtt = await db.attendance.count({ where: { studentId: student.id } });
    const presentAtt = await db.attendance.count({
      where: { studentId: student.id, status: { in: ['present', 'late'] } }
    });
    const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 1000) / 10 : 0;

    const placements = await db.placement.findMany({ where: { studentId: student.id } });
    const eventsAttended = await db.eventParticipant.count({
      where: { studentId: student.id }
    });

    const internalMarks = await db.internalMark.findMany({
      where: { studentId: student.id }
    });
    const avgInternal = internalMarks.length > 0
      ? internalMarks.reduce((sum, m) => sum + (m.total || 0), 0) / internalMarks.length
      : 0;

    // Generate achievements
    const achievements = [
      { id: 'a1', title: 'Academic Excellence', desc: 'CGPA above 8.5', icon: 'graduation', unlocked: student.cgpa >= 8.5, color: 'purple' },
      { id: 'a2', title: 'Perfect Attendance', desc: '90%+ attendance', icon: 'check', unlocked: attPct >= 90, color: 'cyan' },
      { id: 'a3', title: 'Placement Ready', desc: '85%+ readiness', icon: 'trophy', unlocked: student.cgpa * 10 >= 85, color: 'green' },
      { id: 'a4', title: 'Skill Master', desc: '5+ skills listed', icon: 'sparkles', unlocked: skills.length >= 5, color: 'yellow' },
      { id: 'a5', title: 'Event Enthusiast', desc: 'Attended 3+ events', icon: 'calendar', unlocked: eventsAttended >= 3, color: 'blue' },
      { id: 'a6', title: 'Bookworm', desc: 'Active library member', icon: 'book', unlocked: true, color: 'orange' },
      { id: 'a7', title: 'Top Performer', desc: '80%+ in internals', icon: 'star', unlocked: avgInternal >= 40, color: 'rose' },
      { id: 'a8', title: 'Career Driven', desc: 'Applied to 3+ companies', icon: 'target', unlocked: placements.length >= 3, color: 'violet' },
    ];

    // Activity timeline (last 30 days)
    const timeline: { date: string; type: string; title: string; icon: string }[] = [];

    const recentConvs = await db.conversation.findMany({
      where: { studentId: student.id, role: 'user' },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    recentConvs.forEach(c => {
      timeline.push({
        date: c.createdAt.toISOString(),
        type: 'ai',
        title: `Asked ${c.agentType || 'AI'}: "${c.content.slice(0, 50)}${c.content.length > 50 ? '...' : ''}"`,
        icon: 'bot',
      });
    });

    placements.forEach(p => {
      timeline.push({
        date: p.createdAt.toISOString(),
        type: 'placement',
        title: `Applied to ${p.companyName} for ${p.role}`,
        icon: 'target',
      });
    });

    const recentFees = await db.fee.findMany({
      where: { studentId: student.id, paid: true },
      orderBy: { paidDate: 'desc' },
      take: 2,
    });
    recentFees.forEach(f => {
      if (f.paidDate) {
        timeline.push({
          date: f.paidDate.toISOString(),
          type: 'finance',
          title: `Paid ${f.type} fee ₹${f.amount}`,
          icon: 'wallet',
        });
      }
    });

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Stats summary
    const stats = {
      totalClasses: totalAtt,
      attendancePct: attPct,
      eventsAttended,
      companiesApplied: placements.length,
      avgInternal: Math.round(avgInternal * 10) / 10,
      conversationsHad: await db.conversation.count({ where: { studentId: student.id } }),
    };

    return NextResponse.json({
      student: {
        id: student.id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        department: user?.department,
        avatar: user?.avatar,
        rollNumber: student.rollNumber,
        semester: student.semester,
        section: student.section,
        cgpa: student.cgpa,
        hostelRoom: student.hostelRoom,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        skills,
        placementStatus: student.placementStatus,
        createdAt: student.createdAt.toISOString(),
      },
      achievements,
      timeline: timeline.slice(0, 10),
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { skills, phone, placementStatus } = await request.json();
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    const updateData: any = {};
    if (skills !== undefined) updateData.skills = JSON.stringify(skills);
    if (placementStatus !== undefined) updateData.placementStatus = placementStatus;
    if (Object.keys(updateData).length > 0) {
      await db.student.update({ where: { id: student.id }, data: updateData });
    }

    if (phone !== undefined) {
      await db.user.update({ where: { id: student.userId }, data: { phone } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
