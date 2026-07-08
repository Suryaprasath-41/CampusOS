import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { designation: { contains: search } },
      ];
    }

    if (department) {
      where.department = department;
    }

    const [faculty, total] = await Promise.all([
      db.faculty.findMany({
        where,
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
          subjects: {
            select: {
              id: true,
              name: true,
              code: true,
              semester: true,
              credits: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.faculty.count({ where }),
    ]);

    const formatted = faculty.map((f) => ({
      id: f.id,
      department: f.department,
      designation: f.designation,
      cabinLocation: f.cabinLocation,
      createdAt: f.createdAt,
      user: f.user,
      subjects: f.subjects,
      subjectCount: f.subjects.length,
    }));

    return NextResponse.json({ faculty: formatted, total, page, limit });
  } catch (error: any) {
    console.error('Admin faculty GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, department, designation, phone, cabinLocation } = body;

    if (!name || !email || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, department' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Create User first, then Faculty
    const user = await db.user.create({
      data: {
        name,
        email,
        role: 'faculty',
        phone: phone || null,
        department,
      },
    });

    const faculty = await db.faculty.create({
      data: {
        userId: user.id,
        department,
        designation: designation || 'Assistant Professor',
        cabinLocation: cabinLocation || null,
      },
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
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
            credits: true,
          },
        },
      },
    });

    return NextResponse.json({ faculty }, { status: 201 });
  } catch (error: any) {
    console.error('Admin faculty POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
