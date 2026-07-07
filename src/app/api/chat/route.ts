import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Gemini API Setup ────────────────────────────────────────────────
// Put your API key in .env: GEMINI_API_KEY=your-key-here
// Get a free key at: https://aistudio.google.com/apikey
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Lazy-initialized Gemini client (created once, reused)
let genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set. Add it to your .env file. Get a free key at https://aistudio.google.com/apikey');
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

// ─── Agent Prompts ───────────────────────────────────────────────────
const AGENT_PROMPTS: Record<string, string> = {
  master: "You are CampusOS AI, the Master Agent of an intelligent campus operating system. You help students with anything related to their college life - attendance, academics, placements, library, hostel, finance, and events. Be concise, helpful, and friendly. Use emojis sparingly. Provide specific data-driven answers when possible. If you don't know something, give general helpful advice.",
  attendance: "You are the Attendance Intelligence Agent of CampusOS AI. You specialize in attendance analysis, predictions, and advice. Tell students their attendance status, predict future attendance, calculate safe leaves, and suggest strategies to maintain minimum attendance. Always mention risk levels. Be data-driven and specific.",
  placement: "You are the Placement Agent of CampusOS AI. You help students prepare for placements. Analyze their skills, suggest improvements, recommend companies, create study roadmaps, and provide interview tips. Be motivating but realistic. Focus on actionable advice.",
  library: "You are the Library AI Agent of CampusOS AI. You help students find books, check availability, recommend reading materials, and manage their library account. Suggest books based on courses and interests. Be knowledgeable about academic resources.",
  academic: "You are the Academic Planner Agent of CampusOS AI. You help students with schedules, assignments, exam preparation, study plans, and subject-related queries. Be organized and provide structured advice. Help prioritize tasks.",
  hostel: "You are the Hostel Assistant Agent of CampusOS AI. You help with room issues, mess menu, complaints, leave requests, and any hostel-related queries. Be practical and solution-oriented.",
  finance: "You are the Finance Agent of CampusOS AI. You help students with fee payments, scholarships, financial planning, and payment reminders. Be clear about amounts and deadlines.",
};

// ─── Chat Endpoint ───────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { message, agentType } = await request.json();
    if (!message) return NextResponse.json({ response: 'Please ask me something!', agentType: agentType || 'master' });

    const type = agentType || 'master';
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ response: 'No student data found.', agentType: type });

    const user = await db.user.findUnique({ where: { id: student.userId } });

    // Build context from database
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

    // Get recent conversation for context
    const recent = await db.conversation.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    recent.reverse();

    const systemPrompt = AGENT_PROMPTS[type] || AGENT_PROMPTS.master;
    const fullSystem = systemPrompt + `\n\nStudent Context:\n${context}`;

    // Build conversation history for Gemini
    // Gemini uses "user" and "model" roles
    const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

    // Add recent conversation as history (skip the very last - that's the current message)
    if (recent.length > 1) {
      for (const msg of recent.slice(0, -1)) {
        history.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Save user message
    await db.conversation.create({
      data: { studentId: student.id, role: 'user', content: message, agentType: type }
    });

    // Call Gemini API
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash', // Free tier model — fast and capable
      systemInstruction: fullSystem,
    });

    const chat = model.startChat({
      history,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text() || 'I couldn\'t process that. Please try again.';

    // Save AI response
    await db.conversation.create({
      data: { studentId: student.id, role: 'assistant', content: response, agentType: type }
    });

    return NextResponse.json({ response, agentType: type });
  } catch (error: any) {
    console.error('Chat error:', error);

    // Provide helpful error messages
    let errorMsg = 'I encountered an error. Please try again.';
    if (error?.message?.includes('GEMINI_API_KEY')) {
      errorMsg = 'AI is not configured. Add your GEMINI_API_KEY to the .env file. Get a free key at https://aistudio.google.com/apikey';
    } else if (error?.status === 429) {
      errorMsg = 'AI rate limit reached. The free tier allows 15 requests/minute. Please wait a moment and try again.';
    } else if (error?.status === 403) {
      errorMsg = 'AI API key is invalid. Please check your GEMINI_API_KEY in the .env file.';
    }

    return NextResponse.json({ response: errorMsg, agentType: agentType || 'master' });
  }
}
