import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '../login/route';

export async function GET(req: NextRequest) {
  try {
    // Verify admin via HMAC-signed token
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('campusos-token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify and decode the HMAC-signed token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can list users' }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verify admin via HMAC-signed token
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('campusos-token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify and decode the HMAC-signed token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Don't allow deleting yourself
    if (userId === decoded.userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check that the target user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete role-specific records first (due to foreign key constraints)
    if (targetUser.role === 'student') {
      const student = await db.student.findUnique({
        where: { userId: targetUser.id },
        select: { id: true },
      });
      if (student) {
        // Delete all student-related records in order of dependency
        await db.assignmentSubmission.deleteMany({ where: { studentId: student.id } });
        await db.bookTransaction.deleteMany({ where: { studentId: student.id } });
        await db.internalMark.deleteMany({ where: { studentId: student.id } });
        await db.subjectEnrollment.deleteMany({ where: { studentId: student.id } });
        await db.attendance.deleteMany({ where: { studentId: student.id } });
        await db.placement.deleteMany({ where: { studentId: student.id } });
        await db.complaint.deleteMany({ where: { studentId: student.id } });
        await db.leaveRequest.deleteMany({ where: { studentId: student.id } });
        await db.eventParticipant.deleteMany({ where: { studentId: student.id } });
        await db.fee.deleteMany({ where: { studentId: student.id } });
        await db.aiMemory.deleteMany({ where: { studentId: student.id } });
        await db.conversation.deleteMany({ where: { studentId: student.id } });
        await db.student.delete({ where: { id: student.id } });
      }
    } else if (targetUser.role === 'faculty') {
      const faculty = await db.faculty.findUnique({
        where: { userId: targetUser.id },
        select: { id: true },
      });
      if (faculty) {
        // Delete all faculty-related records
        // Subjects taught by this faculty — reassign or remove related records
        const subjects = await db.subject.findMany({
          where: { facultyId: faculty.id },
          select: { id: true },
        });
        const subjectIds = subjects.map(s => s.id);

        if (subjectIds.length > 0) {
          // Delete student records that reference these subjects
          await db.assignmentSubmission.deleteMany({
            where: { assignment: { subjectId: { in: subjectIds } } },
          });
          await db.assignment.deleteMany({ where: { subjectId: { in: subjectIds } } });
          await db.internalMark.deleteMany({ where: { subjectId: { in: subjectIds } } });
          await db.attendance.deleteMany({ where: { subjectId: { in: subjectIds } } });
          await db.subjectEnrollment.deleteMany({ where: { subjectId: { in: subjectIds } } });
          await db.subject.deleteMany({ where: { facultyId: faculty.id } });
        }

        await db.faculty.delete({ where: { id: faculty.id } });
      }
    }

    // Delete user's notifications
    await db.notification.deleteMany({ where: { userId: targetUser.id } });

    // Finally, delete the user record
    await db.user.delete({ where: { id: targetUser.id } });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) has been deleted`,
      deletedUser: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
      },
    });
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
