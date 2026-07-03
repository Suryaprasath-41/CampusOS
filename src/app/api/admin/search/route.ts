import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ students: [], faculty: [], subjects: [] });
    }

    const searchTerm = q.trim();

    const [students, faculty, subjects] = await Promise.all([
      // Search students by name, roll number, email, department
      db.student.findMany({
        where: {
          OR: [
            { user: { name: { contains: searchTerm } } },
            { rollNumber: { contains: searchTerm } },
            { user: { email: { contains: searchTerm } } },
            { department: { contains: searchTerm } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
        take: 10,
      }),
      // Search faculty by name, email, department, designation
      db.faculty.findMany({
        where: {
          OR: [
            { user: { name: { contains: searchTerm } } },
            { user: { email: { contains: searchTerm } } },
            { department: { contains: searchTerm } },
            { designation: { contains: searchTerm } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
        take: 10,
      }),
      // Search subjects by name, code, department
      db.subject.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { code: { contains: searchTerm } },
            { department: { contains: searchTerm } },
          ],
        },
        include: {
          faculty: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        type: 'student' as const,
        name: s.user.name,
        email: s.user.email,
        rollNumber: s.rollNumber,
        department: s.department,
        semester: s.semester,
        cgpa: s.cgpa,
        placementStatus: s.placementStatus,
        avatar: s.user.avatar,
      })),
      faculty: faculty.map((f) => ({
        id: f.id,
        type: 'faculty' as const,
        name: f.user.name,
        email: f.user.email,
        department: f.department,
        designation: f.designation,
        cabinLocation: f.cabinLocation,
        avatar: f.user.avatar,
      })),
      subjects: subjects.map((s) => ({
        id: s.id,
        type: 'subject' as const,
        name: s.name,
        code: s.code,
        department: s.department,
        semester: s.semester,
        credits: s.credits,
        facultyName: s.faculty.user.name,
      })),
      query: searchTerm,
    });
  } catch (error: any) {
    console.error('Admin search GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
