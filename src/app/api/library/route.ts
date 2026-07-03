import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const student = await db.student.findFirst();
    if (!student) return NextResponse.json({ error: 'No students' }, { status: 404 });

    const books = await db.book.findMany();
    const transactions = await db.bookTransaction.findMany({
      where: { studentId: student.id, status: 'borrowed' },
      include: { book: true }
    });

    const categories: Record<string, number> = {};
    books.forEach(b => { categories[b.category] = (categories[b.category] || 0) + 1; });

    return NextResponse.json({
      books: books.map(b => ({
        id: b.id, title: b.title, author: b.author, category: b.category,
        shelfLocation: b.shelfLocation, totalCopies: b.totalCopies,
        availableCopies: b.availableCopies, description: b.description,
      })),
      borrowed: transactions.map(t => {
        const daysUntilDue = Math.ceil((t.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const fine = daysUntilDue < 0 ? Math.abs(daysUntilDue) * 5 : 0;
        return {
          id: t.id, title: t.book.title, author: t.book.author,
          borrowDate: t.borrowDate.toISOString(), dueDate: t.dueDate.toISOString(),
          daysUntilDue, fine, overdue: daysUntilDue < 0,
        };
      }),
      categories,
      totalBooks: books.length,
      availableBooks: books.filter(b => b.availableCopies > 0).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
