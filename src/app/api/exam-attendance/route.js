// app/api/exam/attendance-summary/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const gradeId = searchParams.get('gradeId');
    const subjectId = searchParams.get('subjectId');

    const exams = await prisma.exam.findMany({
      where: {
        status: 'COMPLETED',
        ...(subjectId ? { subjectId: parseInt(subjectId) } : {}),
        ...(gradeId
          ? {
              grades: {
                some: {
                  id: parseInt(gradeId),
                },
              },
            }
          : {}),
      },
      include: {
        results: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 10, // ✅ Limit to 10 exams
    });

    const response = exams.map((exam) => {
      const total = exam.results.length;
      const present = exam.results.filter((r) => r.status !== 'ABSENT').length;
      const absent = total - present;

      return {
        examTitle: exam.title,
        present,
        absent,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
