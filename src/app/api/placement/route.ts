import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });
    const skills: string[] = student.skills ? JSON.parse(student.skills) : [];

    const applications = await db.placement.findMany({ where: { studentId: student.id } });

    const cgpaScore = Math.min(30, student.cgpa * 3.4);
    const skillsScore = Math.min(30, skills.length * 3.5);
    const projectsScore = 18;
    const communicationScore = 15;
    const totalReadiness = Math.round(cgpaScore + skillsScore + projectsScore + communicationScore);

    const targetSkills = ['System Design', 'DSA', 'Cloud Computing', 'Kubernetes', 'CI/CD', 'Microservices'];
    const currentLower = skills.map(s => s.toLowerCase());
    const skillGaps = targetSkills.filter(s => !currentLower.includes(s.toLowerCase()));

    const actions = [
      { priority: 'high', action: 'Learn System Design and DSA patterns', category: 'skills' },
      { priority: 'high', action: 'Build 2-3 portfolio projects on GitHub', category: 'projects' },
      { priority: 'medium', action: 'Practice mock interviews weekly', category: 'interview' },
      { priority: 'medium', action: 'Get AWS/Azure cloud certification', category: 'certification' },
      { priority: 'low', action: 'Contribute to open-source projects', category: 'projects' },
    ];
    if (student.cgpa < 9.0) actions.unshift({ priority: 'high', action: 'Focus on improving CGPA - aim for 9.0+', category: 'academic' });

    return NextResponse.json({
      readiness: {
        total: totalReadiness,
        breakdown: { cgpa: Math.round(cgpaScore * 10) / 10, skills: Math.round(skillsScore * 10) / 10, projects: projectsScore, communication: communicationScore }
      },
      skills,
      applications: applications.map(a => ({
        id: a.id, company: a.companyName, role: a.role, package: a.package,
        status: a.status, interviewDate: a.interviewDate?.toISOString()
      })),
      skillGaps,
      actions,
      companies: [
        { name: 'Google', role: 'SDE-1', match: 85, skills: ['Python', 'DSA', 'System Design'] },
        { name: 'Microsoft', role: 'Software Engineer', match: 78, skills: ['React', 'Azure', 'C++'] },
        { name: 'Amazon', role: 'SDE-1', match: 72, skills: ['Java', 'DSA', 'System Design'] },
        { name: 'Flipkart', role: 'Backend Engineer', match: 80, skills: ['Node.js', 'Java', 'System Design'] },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
