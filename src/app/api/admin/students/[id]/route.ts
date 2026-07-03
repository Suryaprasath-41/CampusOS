import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await db.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            department: true,
          },
        },
        attendance: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
          },
          orderBy: { date: 'desc' },
          take: 50,
        },
        internalMarks: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
          },
        },
        placements: true,
        complaints: {
          orderBy: { createdAt: 'desc' },
        },
        fees: {
          orderBy: { dueDate: 'desc' },
        },
        bookTransactions: {
          include: {
            book: { select: { id: true, title: true, author: true } },
          },
          orderBy: { borrowDate: 'desc' },
        },
        enrollments: {
          include: {
            subject: { select: { id: true, name: true, code: true, credits: true } },
          },
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
        },
        eventParticipations: {
          include: {
            event: { select: { id: true, title: true, type: true, startDate: true } },
          },
        },
        assignmentSubmissions: {
          include: {
            assignment: {
              include: {
                subject: { select: { name: true, code: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Compute attendance summary
    const totalClasses = student.attendance.length;
    const presentClasses = student.attendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 1000) / 10 : 0;

    // Attendance by subject
    const attendanceBySubject: Record<string, { subject: any; total: number; present: number; percentage: number }> = {};
    for (const a of student.attendance) {
      const key = a.subjectId;
      if (!attendanceBySubject[key]) {
        attendanceBySubject[key] = { subject: a.subject, total: 0, present: 0, percentage: 0 };
      }
      attendanceBySubject[key].total++;
      if (a.status === 'present' || a.status === 'late') {
        attendanceBySubject[key].present++;
      }
    }
    for (const key of Object.keys(attendanceBySubject)) {
      const entry = attendanceBySubject[key];
      entry.percentage = entry.total > 0 ? Math.round((entry.present / entry.total) * 1000) / 10 : 0;
    }

    // Marks summary
    const totalMarks = student.internalMarks.reduce((sum, m) => sum + (m.total || 0), 0);
    const maxTotalMarks = student.internalMarks.reduce((sum, m) => sum + m.maxMarks, 0);
    const marksPercentage = maxTotalMarks > 0 ? Math.round((totalMarks / maxTotalMarks) * 1000) / 10 : 0;

    // Fees summary
    const totalFees = student.fees.reduce((sum, f) => sum + f.amount, 0);
    const paidFees = student.fees.filter((f) => f.paid).reduce((sum, f) => sum + f.amount, 0);

    return NextResponse.json({
      student: {
        id: student.id,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester,
        section: student.section,
        cgpa: student.cgpa,
        placementStatus: student.placementStatus,
        hostelRoom: student.hostelRoom,
        skills: student.skills,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        user: student.user,
      },
      attendanceSummary: {
        totalClasses,
        presentClasses,
        attendancePercentage,
        bySubject: Object.values(attendanceBySubject),
      },
      marksSummary: {
        totalMarks,
        maxTotalMarks,
        marksPercentage,
        details: student.internalMarks,
      },
      placements: student.placements,
      complaints: student.complaints,
      fees: {
        total: totalFees,
        paid: paidFees,
        pending: totalFees - paidFees,
        details: student.fees,
      },
      library: {
        currentBorrows: student.bookTransactions.filter((b) => b.status === 'borrowed'),
        history: student.bookTransactions,
      },
      enrollments: student.enrollments,
      leaveRequests: student.leaveRequests,
      eventParticipations: student.eventParticipations,
      assignmentSubmissions: student.assignmentSubmissions,
    });
  } catch (error: any) {
    console.error('Admin student GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const student = await db.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Separate student fields from user fields
    const studentFields: any = {};
    const userFields: any = {};

    if (body.rollNumber !== undefined) studentFields.rollNumber = body.rollNumber;
    if (body.department !== undefined) studentFields.department = body.department;
    if (body.semester !== undefined) studentFields.semester = body.semester;
    if (body.section !== undefined) studentFields.section = body.section;
    if (body.cgpa !== undefined) studentFields.cgpa = body.cgpa;
    if (body.hostelRoom !== undefined) studentFields.hostelRoom = body.hostelRoom;
    if (body.guardianName !== undefined) studentFields.guardianName = body.guardianName;
    if (body.guardianPhone !== undefined) studentFields.guardianPhone = body.guardianPhone;
    if (body.skills !== undefined) studentFields.skills = body.skills;
    if (body.placementStatus !== undefined) studentFields.placementStatus = body.placementStatus;

    if (body.name !== undefined) userFields.name = body.name;
    if (body.email !== undefined) userFields.email = body.email;
    if (body.phone !== undefined) userFields.phone = body.phone;
    if (body.department !== undefined) userFields.department = body.department;

    // Update user fields if any
    if (Object.keys(userFields).length > 0) {
      await db.user.update({
        where: { id: student.userId },
        data: userFields,
      });
    }

    // Update student fields if any
    if (Object.keys(studentFields).length > 0) {
      await db.student.update({
        where: { id },
        data: studentFields,
      });
    }

    const updatedStudent = await db.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ student: updatedStudent });
  } catch (error: any) {
    console.error('Admin student PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await db.student.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete student first (cascading will handle related records based on schema)
    await db.student.delete({ where: { id } });
    // Then delete the associated user
    await db.user.delete({ where: { id: student.userId } });

    return NextResponse.json({ message: 'Student and associated user deleted successfully' });
  } catch (error: any) {
    console.error('Admin student DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
