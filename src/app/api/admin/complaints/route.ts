import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (priority) {
      where.priority = priority;
    }

    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              rollNumber: true,
              department: true,
              semester: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.complaint.count({ where }),
    ]);

    // Get complaint stats
    const stats = await db.complaint.groupBy({
      by: ['status'],
      _count: true,
    });

    const statsByPriority = await db.complaint.groupBy({
      by: ['priority'],
      _count: true,
    });

    return NextResponse.json({
      complaints,
      total,
      page,
      limit,
      stats: {
        byStatus: Object.fromEntries(stats.map((s) => [s.status, s._count])),
        byPriority: Object.fromEntries(statsByPriority.map((s) => [s.priority, s._count])),
      },
    });
  } catch (error: any) {
    console.error('Admin complaints GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority, assignedStaff } = body;

    if (!id) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const complaint = await db.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    // Note: assignedStaff is not in the current schema, but we store it in description as a note
    // For a production app, you'd add an assignedStaff field to the Complaint model

    if (Object.keys(updateData).length === 0 && !assignedStaff) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    if (assignedStaff) {
      // Append assigned staff info to description
      updateData.description = complaint.description + `\n[Assigned to: ${assignedStaff}]`;
    }

    const updatedComplaint = await db.complaint.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            department: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ complaint: updatedComplaint });
  } catch (error: any) {
    console.error('Admin complaints PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
