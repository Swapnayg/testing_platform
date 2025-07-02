import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const gradeId = searchParams.get('gradeId');

  const now = new Date();
  const month = monthParam ? parseInt(monthParam) - 1 : now.getMonth();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();

  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);


  const shouldFilterByGrade = gradeId && gradeId !== 'all';

  const data = await prisma.registration.findMany({
    where: {
      registerdAt: {
        gte: start,
        lte: end,
      },
      ...(shouldFilterByGrade
        ? {
            OR: [
              { catGrade: gradeId },
              {
                student: {
                  gradeId: parseInt(gradeId),
                },
              },
            ],
          }
        : {}),
    },
    select: {
      status: true,
      registerdAt: true,
      catGrade: true,
      student: {
        select: {
          gradeId: true,
        },
      },
    },
  });

  // ✅ Build a map grouped by exact date string
  const summaryMap = {};

  for (const item of data) {
    const dateStr = format(item.registerdAt, 'yyyy-MM-dd');
    if (!summaryMap[dateStr]) {
      summaryMap[dateStr] = { APPROVED: 0, REJECTED: 0 };
    }
    if (item.status === 'APPROVED') {
      summaryMap[dateStr].APPROVED++;
    } else if (item.status === 'REJECTED') {
      summaryMap[dateStr].REJECTED++;
    }
  }

  // ✅ Fill all days of the month, even those with 0
  const days = eachDayOfInterval({ start, end });
  const summary = days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return {
      date: dateStr,
      APPROVED: summaryMap[dateStr]?.APPROVED || 0,
      REJECTED: summaryMap[dateStr]?.REJECTED || 0,
    };
  });

  return Response.json(summary);
}
