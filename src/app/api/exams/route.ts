import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    // Get subjects for current semester
    const enrollments = await db.subjectEnrollment.findMany({
      where: { studentId: student.id, semester: student.semester },
      include: { subject: { include: { faculty: { include: { user: true } } } } },
    });

    // Build exam schedule (upcoming exams based on assignments & internal marks)
    const upcomingExams = enrollments.map((e, i) => {
      const examDate = new Date();
      examDate.setDate(examDate.getDate() + 7 + i * 4);
      return {
        id: `exam-${e.subject.id}`,
        subjectCode: e.subject.code,
        subjectName: e.subject.name,
        faculty: e.subject.faculty.user.name,
        examType: i % 2 === 0 ? 'Mid Semester' : 'End Semester',
        date: examDate.toISOString(),
        time: '10:00 AM',
        duration: '3 hours',
        maxMarks: 100,
        venue: `Hall-${100 + i}`,
        syllabus: `Units 1-5 of ${e.subject.name}`,
        preparation: 30 + Math.floor(Math.random() * 60),
      };
    });

    // Past results from internal marks
    const internalMarks = await db.internalMark.findMany({
      where: { studentId: student.id },
      include: { subject: true },
    });

    const pastResults = internalMarks.map(m => {
      const rawPct = m.total && m.maxMarks ? (m.total / m.maxMarks) * 100 : 0;
      const percentage = Math.min(100, Math.round(rawPct * 10) / 10);
      return {
        id: m.id,
        subjectCode: m.subject.code,
        subjectName: m.subject.name,
        semester: m.semester,
        test1: m.test1,
        test2: m.test2,
        assignment1: m.assignment1,
        assignment2: m.assignment2,
        total: m.total,
        maxMarks: m.maxMarks,
        percentage,
        grade: percentage >= 90 ? 'A+' :
              percentage >= 80 ? 'A' :
              percentage >= 70 ? 'B+' :
              percentage >= 60 ? 'B' : 'C',
      };
    });

    // Semester-wise performance (current semester from real data + historical trend)
    const semesterWise: Record<number, { total: number; max: number; count: number }> = {};
    internalMarks.forEach(m => {
      if (!semesterWise[m.semester]) {
        semesterWise[m.semester] = { total: 0, max: 0, count: 0 };
      }
      semesterWise[m.semester].total += m.total || 0;
      semesterWise[m.semester].max += m.maxMarks;
      semesterWise[m.semester].count += 1;
    });

    // Build historical trend: synthesize semesters 1-5 based on CGPA trend + current real data
    const currentSem = student.semester;
    const currentAvg = semesterWise[currentSem]?.max > 0
      ? Math.min(100, (semesterWise[currentSem].total / semesterWise[currentSem].max) * 100)
      : 80;

    const semesterPerformance: { semester: number; avgPercentage: number; subjects: number }[] = [];
    // Historical semesters with an upward trend leading to current CGPA
    const trendSeed = [
      { sem: 1, pct: 72, subs: 6 },
      { sem: 2, pct: 75, subs: 6 },
      { sem: 3, pct: 78, subs: 6 },
      { sem: 4, pct: 81, subs: 6 },
      { sem: 5, pct: 84, subs: 6 },
    ];
    trendSeed.forEach(t => {
      if (t.sem < currentSem) {
        semesterPerformance.push({ semester: t.sem, avgPercentage: t.pct, subjects: t.subs });
      }
    });
    semesterPerformance.push({
      semester: currentSem,
      avgPercentage: Math.round(currentAvg * 10) / 10,
      subjects: semesterWise[currentSem]?.count || 6,
    });
    semesterPerformance.sort((a, b) => a.semester - b.semester);

    // Prep recommendations
    const recommendations = upcomingExams.slice(0, 3).map(exam => ({
      subject: exam.subjectName,
      daysLeft: Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      currentPrep: exam.preparation,
      recommended: [
        'Revise unit summaries',
        'Solve previous year papers',
        'Take mock test',
        'Group study for tough topics',
      ],
    }));

    return NextResponse.json({
      upcomingExams,
      pastResults,
      semesterPerformance,
      recommendations,
      summary: {
        totalUpcoming: upcomingExams.length,
        avgPreparation: Math.round(upcomingExams.reduce((s, e) => s + e.preparation, 0) / upcomingExams.length),
        bestSubject: pastResults.reduce((best, r) =>
          !best || (r.percentage > best.percentage) ? r : best, null as any),
        weakestSubject: pastResults.reduce((worst, r) =>
          !worst || (r.percentage < worst.percentage) ? r : worst, null as any),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
