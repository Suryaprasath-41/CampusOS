import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

const AGENT_PROMPTS: Record<string, string> = {
  master: "You are CampusOS AI, the Master Agent of an intelligent campus operating system. You help students with anything related to their college life - attendance, academics, placements, library, hostel, finance, and events. Be concise, helpful, and friendly. Use emojis sparingly. Provide specific data-driven answers when possible. If you don't know something, give general helpful advice.",
  attendance: "You are the Attendance Intelligence Agent of CampusOS AI. You specialize in attendance analysis, predictions, and advice. Tell students their attendance status, predict future attendance, calculate safe leaves, and suggest strategies to maintain minimum attendance. Always mention risk levels. Be data-driven and specific.",
  placement: "You are the Placement Agent of CampusOS AI. You help students prepare for placements. Analyze their skills, suggest improvements, recommend companies, create study roadmaps, and provide interview tips. Be motivating but realistic. Focus on actionable advice.",
  library: "You are the Library AI Agent of CampusOS AI. You help students find books, check availability, recommend reading materials, and manage their library account. Suggest books based on courses and interests. Be knowledgeable about academic resources.",
  academic: "You are the Academic Planner Agent of CampusOS AI. You help students with schedules, assignments, exam preparation, study plans, and subject-related queries. Be organized and provide structured advice. Help prioritize tasks.",
  hostel: "You are the Hostel Assistant Agent of CampusOS AI. You help with room issues, mess menu, complaints, leave requests, and any hostel-related queries. Be practical and solution-oriented.",
  finance: "You are the Finance Agent of CampusOS AI. You help students with fee payments, scholarships, financial planning, and payment reminders. Be clear about amounts and deadlines.",
};

export async function POST(request: Request) {
  try {
    const { message, agentType } = await request.json();
    if (!message) return NextResponse.json({ response: 'Please ask me something!', agentType: agentType || 'master' });

    const type = agentType || 'master';
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ response: 'No student data found.', agentType: type });

    const user = await db.user.findUnique({ where: { id: student.userId } });

    // Build context
    const totalAtt = await db.attendance.count({ where: { studentId: student.id } });
    const presentAtt = await db.attendance.count({
      where: { studentId: student.id, status: { in: ['present', 'late'] } }
    });
    const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 1000) / 10 : 0;
    const pendingFees = await db.fee.count({ where: { studentId: student.id, paid: false } });

    const context = `Name: ${user?.name}
Roll Number: ${student.rollNumber}
Department: ${student.department}
Semester: ${student.semester}
CGPA: ${student.cgpa}
Attendance: ${attPct}% (${presentAtt}/${totalAtt})
Skills: ${student.skills || '[]'}
Hostel Room: ${student.hostelRoom || 'N/A'}
Pending Fees: ${pendingFees}
Placement Status: ${student.placementStatus}`;

    // Get recent conversation
    const recent = await db.conversation.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    recent.reverse();

    const systemPrompt = AGENT_PROMPTS[type] || AGENT_PROMPTS.master;
    const fullSystem = systemPrompt + `\n\nStudent Context:\n${context}`;

    // Build messages
    const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
      { role: 'assistant', content: fullSystem },
    ];

    if (recent.length > 1) {
      const historyText = recent.slice(0, -1).map(r => `${r.role}: ${r.content}`).join('\n');
      messages.push({ role: 'user', content: `Previous conversation:\n${historyText}\n\nCurrent message: ${message}` });
    } else {
      messages.push({ role: 'user', content: message });
    }

    // Save user message
    await db.conversation.create({
      data: { studentId: student.id, role: 'user', content: message, agentType: type }
    });

    // Call LLM
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content || 'I couldn\'t process that. Please try again.';

    // Save response
    await db.conversation.create({
      data: { studentId: student.id, role: 'assistant', content: response, agentType: type }
    });

    return NextResponse.json({ response, agentType: type });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ response: 'I encountered an error. Please try again.', agentType: 'master' });
  }
}
