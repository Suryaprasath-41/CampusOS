import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, targetDepartment, targetSemester, targetAll } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message' },
        { status: 400 }
      );
    }

    // Build user filter based on target criteria
    const userWhere: any = {};

    if (!targetAll) {
      const conditions: any[] = [];

      if (targetDepartment) {
        conditions.push({ department: targetDepartment });
      }

      if (targetSemester) {
        // If targeting a semester, we need to find students in that semester and get their user IDs
        const studentsInSemester = await db.student.findMany({
          where: { semester: parseInt(targetSemester) },
          select: { userId: true },
        });
        if (studentsInSemester.length > 0) {
          conditions.push({
            id: { in: studentsInSemester.map((s) => s.userId) },
          });
        } else {
          // No students in this semester
          return NextResponse.json({
            success: true,
            notificationsCreated: 0,
            message: 'No matching users found for the specified criteria',
          });
        }
      }

      if (conditions.length > 0) {
        userWhere.AND = conditions;
      } else {
        // No target specified and targetAll is false
        return NextResponse.json(
          { error: 'Specify targetDepartment, targetSemester, or set targetAll to true' },
          { status: 400 }
        );
      }
    }

    // Find all matching users
    const users = await db.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        notificationsCreated: 0,
        message: 'No matching users found',
      });
    }

    // Create notifications for all matching users
    const notifications = await db.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title,
        message,
        type: type || 'info',
        read: false,
      })),
    });

    return NextResponse.json({
      success: true,
      notificationsCreated: notifications.count,
      targetUserCount: users.length,
    });
  } catch (error: any) {
    console.error('Admin broadcast notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
